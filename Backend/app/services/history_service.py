# Backend/app/services/history_service.py

from app.database.db import get_db_connection, return_db_connection
from datetime import datetime

def save_prediction(disease_name, confidence, user_id=None, image_path=None, notes=None):
    """Save a diagnosis prediction to the database"""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Get disease_id from disease_name
        cursor.execute(
            "SELECT id FROM diseases WHERE LOWER(disease_name) = LOWER(%s)",
            (disease_name,)
        )
        disease_result = cursor.fetchone()
        
        if not disease_result:
            print(f"Disease not found: {disease_name}")
            return None

        disease_id = disease_result[0]

        # Insert diagnosis
        cursor.execute(
            """
            INSERT INTO diagnoses (user_id, disease_id, confidence_score, image_path, notes, created_at)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
            """,
            (user_id, disease_id, confidence, image_path, notes, datetime.now())
        )
        
        diagnosis_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        
        return diagnosis_id

    except Exception as e:
        print(f"Error saving prediction: {e}")
        if conn:
            conn.rollback()
        return None
    finally:
        if conn:
            return_db_connection(conn)

def get_diagnosis_history(user_id=None, limit=10):
    """Retrieve diagnosis history"""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        if user_id:
            query = """
            SELECT d.id, ds.disease_name, d.confidence_score, d.created_at
            FROM diagnoses d
            JOIN diseases ds ON d.disease_id = ds.id
            WHERE d.user_id = %s
            ORDER BY d.created_at DESC
            LIMIT %s
            """
            cursor.execute(query, (user_id, limit))
        else:
            query = """
            SELECT d.id, ds.disease_name, d.confidence_score, d.created_at
            FROM diagnoses d
            JOIN diseases ds ON d.disease_id = ds.id
            ORDER BY d.created_at DESC
            LIMIT %s
            """
            cursor.execute(query, (limit,))

        results = cursor.fetchall()
        cursor.close()

        diagnoses = []
        for result in results:
            diagnoses.append({
                "id": result[0],
                "disease": result[1],
                "confidence": float(result[2]),
                "created_at": result[3].isoformat() if result[3] else None
            })

        return diagnoses

    except Exception as e:
        print(f"Error retrieving diagnosis history: {e}")
        return []
    finally:
        if conn:
            return_db_connection(conn)