# Backend/app/routes/history.py

from fastapi import APIRouter, Query, Body
from app.services.history_service import get_diagnosis_history, clear_diagnosis_history, sync_diagnosis_history

router = APIRouter()


def _history_response(user_id: int, limit: int):
    diagnoses = get_diagnosis_history(user_id=user_id, limit=limit)
    return {
        "success": True,
        "count": len(diagnoses),
        "diagnoses": diagnoses,
    }


@router.get("/history")
async def get_history(user_id: int = Query(..., description="User ID is required"), limit: int = Query(10, le=100)):
    try:
        return _history_response(user_id=user_id, limit=limit)
    except Exception as e:
        print(f"Error in get_history: {e}")
        return {
            "success": False,
            "error": str(e),
            "diagnoses": [],
        }


@router.post("/history/sync")
async def sync_history(user_id: int = Query(..., description="User ID is required"), diagnoses: list[dict] = Body(default=[])):
    try:
        inserted = sync_diagnosis_history(user_id=user_id, diagnoses=diagnoses)
        return {
            "success": True,
            "inserted": inserted,
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "inserted": 0,
        }


@router.get("/diagnoses")
async def get_diagnoses(user_id: int = Query(..., description="User ID is required"), limit: int = Query(10, le=100)):
    try:
        return _history_response(user_id=user_id, limit=limit)
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "diagnoses": [],
        }


@router.delete("/history")
async def delete_history(user_id: int | None = Query(None), all_records: bool = Query(False)):
    try:
        if user_id is None and not all_records:
            return {
                "success": False,
                "error": "user_id is required unless all_records=true",
                "deleted": 0,
            }

        deleted = clear_diagnosis_history(user_id=user_id if not all_records else None)
        return {
            "success": True,
            "deleted": deleted,
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "deleted": 0,
        }
