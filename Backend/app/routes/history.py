# Backend/app/routes/history.py

from fastapi import APIRouter, Query
from app.services.history_service import get_diagnosis_history, clear_diagnosis_history

router = APIRouter()


def _history_response(user_id: int | None, limit: int):
    diagnoses = get_diagnosis_history(user_id=user_id, limit=limit)
    return {
        "success": True,
        "count": len(diagnoses),
        "diagnoses": diagnoses
    }


@router.get("/history")
async def get_history(user_id: int = Query(None), limit: int = Query(10, le=100)):
    """
    Retrieve diagnosis history

    Parameters:
        - user_id: Filter by user (optional)
        - limit: Maximum number of records (default: 10, max: 100)

    Returns:
        List of diagnoses with disease, confidence, and timestamp
    """
    try:
        return _history_response(user_id=user_id, limit=limit)
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "diagnoses": []
        }


@router.get("/diagnoses")
async def get_diagnoses(user_id: int = Query(None), limit: int = Query(10, le=100)):
    """Alias endpoint used in project report workflow."""
    try:
        return _history_response(user_id=user_id, limit=limit)
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "diagnoses": []
        }


@router.delete("/history")
async def delete_history(user_id: int = Query(None)):
    """Clear diagnosis history for all records or for a specific user_id."""
    try:
        deleted = clear_diagnosis_history(user_id=user_id)
        return {
            "success": True,
            "deleted": deleted
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "deleted": 0
        }
