from __future__ import annotations

import json
import os
import re
import urllib.parse
import urllib.request
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.database.db import get_db_connection, return_db_connection

router = APIRouter()


class GoogleAuthRequest(BaseModel):
    credential: Optional[str] = None
    access_token: Optional[str] = None


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


def _slug_username(email: str) -> str:
    base = email.split("@", 1)[0].strip().lower() or "user"
    base = re.sub(r"[^a-z0-9_\.\-]", "_", base)
    return base[:90] or "user"


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
            return {"id": user_id, "username": row[1], "email": row[2], "full_name": full_name or row[3]}

        base_username = _slug_username(email)
        username = base_username
        suffix = 1
        while True:
            cur.execute("SELECT 1 FROM users WHERE username = %s", (username,))
            if not cur.fetchone():
                break
            suffix += 1
            username = f"{base_username}_{suffix}"

        cur.execute(
            """
            INSERT INTO users (username, email, password_hash, full_name)
            VALUES (%s, %s, %s, %s)
            RETURNING id, username, email, COALESCE(full_name, '')
            """,
            (username, email, "GOOGLE_OAUTH", full_name),
        )
        created = cur.fetchone()
        conn.commit()

        return {
            "id": int(created[0]),
            "username": created[1],
            "email": created[2],
            "full_name": created[3],
        }
    except HTTPException:
        raise
    except Exception as exc:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create/login user: {exc}")
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
