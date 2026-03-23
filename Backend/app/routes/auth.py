from __future__ import annotations

import json
import os
import re
import urllib.parse
import urllib.request
from hashlib import sha256
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.database.db import get_db_connection, return_db_connection

router = APIRouter()


class GoogleAuthRequest(BaseModel):
    credential: Optional[str] = None
    access_token: Optional[str] = None


class SignupRequest(BaseModel):
    username: Optional[str] = None
    email: str
    password: str
    full_name: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str


MIN_PASSWORD_LENGTH = 6
GOOGLE_PASSWORD_PLACEHOLDER = "GOOGLE_OAUTH"


def _normalize_email(email: str) -> str:
    return (email or "").strip().lower()


def _slug_username(email: str) -> str:
    base = email.split("@", 1)[0].strip().lower() or "user"
    base = re.sub(r"[^a-z0-9_\.\-]", "_", base)
    return base[:90] or "user"


def _hash_password(password: str) -> str:
    return "sha256$" + sha256(password.encode("utf-8")).hexdigest()


def _verify_password(password: str, stored_password: str) -> bool:
    if not stored_password:
        return False
    if stored_password == GOOGLE_PASSWORD_PLACEHOLDER:
        return False
    if stored_password.startswith("sha256$"):
        return stored_password == _hash_password(password)
    # Allow legacy plaintext rows to continue working in development.
    return stored_password == password


def _serialize_user(row) -> dict:
    return {
        "id": int(row[0]),
        "username": row[1],
        "email": row[2],
        "full_name": row[3] or row[1],
    }


def _ensure_unique_username(cur, requested_username: str | None, email: str) -> str:
    base_username = (requested_username or "").strip().lower() or _slug_username(email)
    base_username = re.sub(r"[^a-z0-9_\.\-]", "_", base_username)[:90] or "user"

    username = base_username
    suffix = 1
    while True:
        cur.execute("SELECT 1 FROM users WHERE username = %s", (username,))
        if not cur.fetchone():
            return username
        suffix += 1
        username = f"{base_username}_{suffix}"


def _verify_google_id_token(id_token: str) -> dict:
    if not id_token:
        raise HTTPException(status_code=400, detail="Missing Google credential")

    url = "https://oauth2.googleapis.com/tokeninfo?" + urllib.parse.urlencode({"id_token": id_token})

    try:
        with urllib.request.urlopen(url, timeout=10) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except Exception as exc:
        raise HTTPException(status_code=401, detail=f"Google token verification failed: {exc}")

    if payload.get("error_description") or payload.get("error"):
        raise HTTPException(status_code=401, detail=payload.get("error_description") or payload.get("error"))

    expected_client_id = os.getenv("GOOGLE_CLIENT_ID", "").strip()
    aud = (payload.get("aud") or "").strip()
    if expected_client_id and aud != expected_client_id:
        raise HTTPException(status_code=401, detail="Google token audience mismatch")

    if str(payload.get("email_verified", "false")).lower() not in {"true", "1"}:
        raise HTTPException(status_code=401, detail="Google account email is not verified")

    return payload


def _verify_google_access_token(access_token: str) -> dict:
    if not access_token:
        raise HTTPException(status_code=400, detail="Missing Google access token")

    url = "https://oauth2.googleapis.com/tokeninfo?" + urllib.parse.urlencode({"access_token": access_token})
    try:
        with urllib.request.urlopen(url, timeout=10) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except Exception as exc:
        raise HTTPException(status_code=401, detail=f"Google token verification failed: {exc}")

    if payload.get("error_description") or payload.get("error"):
        raise HTTPException(status_code=401, detail=payload.get("error_description") or payload.get("error"))

    expected_client_id = os.getenv("GOOGLE_CLIENT_ID", "").strip()
    aud = (payload.get("aud") or "").strip()
    if expected_client_id and aud != expected_client_id:
        raise HTTPException(status_code=401, detail="Google token audience mismatch")

    return payload


def _fetch_google_userinfo(access_token: str) -> dict:
    req = urllib.request.Request(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except Exception as exc:
        raise HTTPException(status_code=401, detail=f"Failed to fetch Google user profile: {exc}")

    return payload


def _upsert_google_user(email: str, full_name: str) -> dict:
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            "SELECT id, username, email, COALESCE(full_name, '') FROM users WHERE email = %s",
            (email,),
        )
        row = cur.fetchone()

        if row:
            user_id = int(row[0])
            cur.execute(
                "UPDATE users SET full_name = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                (full_name, user_id),
            )
            conn.commit()
            return _serialize_user((user_id, row[1], row[2], full_name or row[3]))

        username = _ensure_unique_username(cur, None, email)
        cur.execute(
            """
            INSERT INTO users (username, email, password_hash, full_name)
            VALUES (%s, %s, %s, %s)
            RETURNING id, username, email, COALESCE(full_name, '')
            """,
            (username, email, GOOGLE_PASSWORD_PLACEHOLDER, full_name),
        )
        created = cur.fetchone()
        conn.commit()

        return _serialize_user(created)
    except HTTPException:
        raise
    except Exception as exc:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create/login user: {exc}")
    finally:
        if conn:
            return_db_connection(conn)


@router.post("/auth/signup")
async def signup(payload: SignupRequest):
    email = _normalize_email(payload.email)
    password = payload.password or ""
    full_name = (payload.full_name or "").strip()

    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    if len(password) < MIN_PASSWORD_LENGTH:
        raise HTTPException(status_code=400, detail=f"Password must be at least {MIN_PASSWORD_LENGTH} characters")

    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("SELECT 1 FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            raise HTTPException(status_code=409, detail="An account with this email already exists")

        username = _ensure_unique_username(cur, payload.username, email)
        cur.execute(
            """
            INSERT INTO users (username, email, password_hash, full_name)
            VALUES (%s, %s, %s, %s)
            RETURNING id, username, email, COALESCE(full_name, '')
            """,
            (username, email, _hash_password(password), full_name),
        )
        created = cur.fetchone()
        conn.commit()
        return _serialize_user(created)
    except HTTPException:
        if conn:
            conn.rollback()
        raise
    except Exception as exc:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Signup failed: {exc}")
    finally:
        if conn:
            return_db_connection(conn)


@router.post("/auth/login")
async def login(payload: LoginRequest):
    email = _normalize_email(payload.email)
    password = payload.password or ""

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "SELECT id, username, email, COALESCE(full_name, ''), password_hash FROM users WHERE email = %s",
            (email,),
        )
        row = cur.fetchone()
        if not row or not _verify_password(password, row[4]):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        if not str(row[4]).startswith("sha256$") and row[4] != GOOGLE_PASSWORD_PLACEHOLDER:
            cur.execute(
                "UPDATE users SET password_hash = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                (_hash_password(password), int(row[0])),
            )
            conn.commit()

        user = _serialize_user(row[:4])
        return {"success": True, "user": user}
    except HTTPException:
        if conn:
            conn.rollback()
        raise
    except Exception as exc:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Login failed: {exc}")
    finally:
        if conn:
            return_db_connection(conn)


@router.get("/auth/me/{user_id}")
async def get_user(user_id: int):
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "SELECT id, username, email, COALESCE(full_name, '') FROM users WHERE id = %s",
            (user_id,),
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="User not found")
        return _serialize_user(row)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to load user: {exc}")
    finally:
        if conn:
            return_db_connection(conn)


@router.get("/auth/google/config")
async def get_google_config():
    return {
        "configured": bool(os.getenv("GOOGLE_CLIENT_ID", "").strip()),
        "client_id": os.getenv("GOOGLE_CLIENT_ID", "").strip(),
    }


@router.post("/auth/google")
async def google_auth(payload: GoogleAuthRequest):
    if payload.access_token:
        _verify_google_access_token(payload.access_token)
        token_payload = _fetch_google_userinfo(payload.access_token)
    elif payload.credential:
        token_payload = _verify_google_id_token(payload.credential)
    else:
        raise HTTPException(status_code=400, detail="Missing Google credential payload")

    email = (token_payload.get("email") or "").strip().lower()
    if not email:
        raise HTTPException(status_code=401, detail="Google token does not include email")

    full_name = (token_payload.get("name") or "").strip() or email.split("@", 1)[0]
    picture = (token_payload.get("picture") or "").strip()

    user = _upsert_google_user(email=email, full_name=full_name)

    return {
        "success": True,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["full_name"] or full_name,
            "username": user["username"],
            "picture": picture,
            "provider": "google",
        },
    }
