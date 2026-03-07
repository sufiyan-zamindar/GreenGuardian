# Backend/app/services/history_service.py

from app.database.db import get_db_connection, return_db_connection
from datetime import datetime

from app.services.disease_name_service import find_disease_record


def save_prediction(disease_name, confidence, user_id=None, image_path=None, notes=None, return_error=False):
    """Save a diagnosis prediction to the database."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        disease_record = find_disease_record(cursor, disease_name)

        # If model label is missing from seeds, auto-register it so history is never dropped.
        if not disease_record:
            label = str(disease_name or "Unknown").strip()
            display_name = label.replace("_", " ").replace("__", " ").strip() or "Unknown"

            cursor.execute(
                """
                INSERT INTO diseases (disease_name, category, description)
                VALUES (%s, %s, %s)
                ON CONFLICT (disease_name) DO UPDATE SET disease_name = EXCLUDED.disease_name
                RETURNING id
                """,
                (display_name, "unknown", "Auto-created from model prediction label")
            )
            disease_id = cursor.fetchone()[0]
            print(f"Auto-created disease row for missing label '{label}' -> id={disease_id}")
        else:
            disease_id = disease_record[0]

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

        return (diagnosis_id, None) if return_error else diagnosis_id

    except Exception as e:
        print(f"Error saving prediction: {e}")
        if conn:
            conn.rollback()
        return (None, str(e)) if return_error else None
    finally:
        if conn:
            return_db_connection(conn)

def get_diagnosis_history(user_id=None, limit=10):
    """Retrieve diagnosis history"""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        base_select = """
            SELECT
                d.id,
                ds.disease_name,
                d.confidence_score,
                d.created_at,
                {severity_expr}
            FROM diagnoses d
            JOIN diseases ds ON d.disease_id = ds.id
            {severity_join}
            {where_clause}
            ORDER BY d.created_at DESC
            LIMIT %s
        """

        def run_query(include_profiles=True):
            severity_expr = "dp.severity_level" if include_profiles else "'unknown'::text"
            severity_join = "LEFT JOIN disease_profiles dp ON dp.disease_id = ds.id" if include_profiles else ""
            where_clause = "WHERE d.user_id = %s" if user_id is not None else ""
            query = base_select.format(
                severity_expr=severity_expr,
                severity_join=severity_join,
                where_clause=where_clause
            )
            if user_id is not None:
                cursor.execute(query, (user_id, limit))
            else:
                cursor.execute(query, (limit,))

        try:
            run_query(include_profiles=True)
        except Exception as profile_err:
            # Older DBs may miss disease_profiles; return history without severity instead of empty list.
            print(f"History query with disease_profiles failed: {profile_err}. Retrying without profile join.")
            run_query(include_profiles=False)

        results = cursor.fetchall()
        cursor.close()

        diagnoses = []
        for result in results:
            diagnoses.append({
                "id": result[0],
                "disease": result[1],
                "confidence": float(result[2]),
                "created_at": result[3].isoformat() if result[3] else None,
                "severity": (result[4] or "unknown").lower()
            })

        return diagnoses

    except Exception as e:
        print(f"Error retrieving diagnosis history: {e}")
        return []
    finally:
        if conn:
            return_db_connection(conn)

def clear_diagnosis_history(user_id=None):
    """Delete diagnosis history records and return number of rows deleted."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        if user_id:
            cursor.execute("DELETE FROM diagnoses WHERE user_id = %s", (user_id,))
        else:
            cursor.execute("DELETE FROM diagnoses")

        deleted_count = cursor.rowcount or 0
        conn.commit()
        cursor.close()
        return deleted_count
    except Exception as e:
        print(f"Error clearing diagnosis history: {e}")
        if conn:
            conn.rollback()
        return 0
    finally:
        if conn:
            return_db_connection(conn)
