# Backend/app/routes/history.py

from fastapi import APIRouter
from app.database.db import get_db_connection

router = APIRouter()

@router.get("/history")

def get_history():

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT d.disease_name, confidence_score, prediction_time
        FROM diagnoses dg
        JOIN diseases d ON d.id = dg.disease_id
        ORDER BY prediction_time DESC
        LIMIT 10
        """
    )

    rows = cur.fetchall()

    cur.close()
    conn.close()

    return [
        {
            "disease": r[0],
            "confidence": r[1],
            "time": r[2]
        }
        for r in rows
    ]