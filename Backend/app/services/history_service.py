# Backend/app/services/history_service.py

from app.database.db import get_db_connection

def save_prediction(disease, confidence):

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO diagnoses (disease_id, confidence_score)
        SELECT id, %s
        FROM diseases
        WHERE disease_name=%s
        """,
        (confidence, disease)
    )

    conn.commit()
    cur.close()
    conn.close()