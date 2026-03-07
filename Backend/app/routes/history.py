# Backend/app/routes/history.py

from fastapi import APIRouter, Query
from app.services.history_service import get_diagnosis_history

router = APIRouter()

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
        diagnoses = get_diagnosis_history(user_id=user_id, limit=limit)
        
        return {
            "success": True,
            "count": len(diagnoses),
            "diagnoses": diagnoses
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "diagnoses": []
        }