from app.database.db import get_db_connection, return_db_connection
from datetime import datetime
import traceback
from app.services.disease_name_service import find_disease_record
from app.services.severity_service import resolve_severity


STATUS_VALUES = {"in_progress", "resolved", "worsened"}


def _normalize_status(value):
    status = str(value or "in_progress").strip().lower()
    return status if status in STATUS_VALUES else "in_progress"


def _get_model_context(cursor, disease_id):
    cursor.execute(
        """
        SELECT mc.id, mc.plant_id
        FROM model_classes mc
        WHERE mc.disease_id = %s
        ORDER BY mc.id ASC
        LIMIT 1
        """,
        (disease_id,),
    )
    row = cursor.fetchone()
    model_class_id = row[0] if row else None
    plant_id = row[1] if row else None

    cursor.execute(
        """
        SELECT id
        FROM model_versions
        ORDER BY deployment_date DESC NULLS LAST, id DESC
        LIMIT 1
        """
    )
    version_row = cursor.fetchone()
    model_version_id = version_row[0] if version_row else None
    return plant_id, model_class_id, model_version_id


def save_prediction(disease_name, confidence, user_id=None, image_path=None, notes=None, return_error=False, created_at=None):
    """Save a diagnosis prediction to the normalized database schema."""
    conn = None
    try:
        print(f"save_prediction called with: disease={disease_name}, confidence={confidence}, user_id={user_id}")

        conn = get_db_connection()
        cursor = conn.cursor()

        disease_record = find_disease_record(cursor, disease_name)
        if not disease_record:
            error_msg = f"Disease '{disease_name}' not found in diseases/model_classes seed data"
            if return_error:
                return None, error_msg
            return None

        disease_id = disease_record[0]

        if user_id:
            cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
            user_exists = cursor.fetchone()
            if not user_exists:
                error_msg = f"User ID {user_id} does not exist in database"
                if return_error:
                    return None, error_msg
                return None

        plant_id, model_class_id, model_version_id = _get_model_context(cursor, disease_id)
        prediction_time = created_at or datetime.now()
        status = _normalize_status(notes)

        cursor.execute(
            """
            SELECT id
            FROM diagnoses
            WHERE user_id IS NOT DISTINCT FROM %s
              AND disease_id = %s
              AND ABS(confidence_score - %s) < 0.000001
              AND prediction_time = %s
            LIMIT 1
            """,
            (user_id, disease_id, confidence, prediction_time),
        )
        existing = cursor.fetchone()
        if existing:
            diagnosis_id = existing[0]
            cursor.execute(
                "UPDATE diagnoses SET status = %s WHERE id = %s",
                (status, diagnosis_id),
            )
            conn.commit()
            if return_error:
                return diagnosis_id, None
            return diagnosis_id

        cursor.execute(
            """
            INSERT INTO diagnoses (
                user_id,
                plant_id,
                disease_id,
                model_class_id,
                model_version_id,
                confidence_score,
                image_path,
                prediction_time,
                created_at,
                status
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
            """,
            (
                user_id,
                plant_id,
                disease_id,
                model_class_id,
                model_version_id,
                confidence,
                image_path,
                prediction_time,
                prediction_time,
                status,
            )
        )

        diagnosis_id = cursor.fetchone()[0]
        conn.commit()

        if return_error:
            return diagnosis_id, None
        return diagnosis_id

    except Exception as e:
        print(f"Error saving prediction: {e}")
        traceback.print_exc()
        if conn:
            conn.rollback()
        if return_error:
            return None, str(e)
        return None
    finally:
        if conn:
            return_db_connection(conn)



def get_diagnosis_history(user_id=None, limit=10):
    """Retrieve diagnosis history for one user from PostgreSQL."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        if user_id is None:
            print("WARNING: Attempt to fetch history without user_id - returning empty list")
            return []

        query = """
            SELECT
                d.id,
                ds.disease_name,
                d.confidence_score,
                COALESCE(d.created_at, d.prediction_time) AS created_at,
                COALESCE(dp.severity_level, 'unknown') AS severity,
                COALESCE(d.status, 'in_progress') AS status
            FROM diagnoses d
            JOIN diseases ds ON d.disease_id = ds.id
            LEFT JOIN disease_profiles dp ON dp.disease_id = ds.id
            WHERE d.user_id = %s
            ORDER BY COALESCE(d.created_at, d.prediction_time) DESC
            LIMIT %s
        """

        cursor.execute(query, (user_id, limit))
        results = cursor.fetchall()
        cursor.close()

        diagnoses = []
        for result in results:
            diagnoses.append({
                "id": result[0],
                "disease": result[1],
                "confidence": float(result[2]),
                "created_at": result[3].isoformat() if result[3] else None,
                "severity": resolve_severity(result[4], result[1]),
                "status": _normalize_status(result[5]),
            })

        print(f"Retrieved {len(diagnoses)} diagnoses for user {user_id}")
        return diagnoses

    except Exception as e:
        print(f"Error retrieving diagnosis history: {e}")
        traceback.print_exc()
        return []
    finally:
        if conn:
            return_db_connection(conn)



def sync_diagnosis_history(user_id: int, diagnoses: list[dict]):
    inserted = 0
    for item in diagnoses or []:
        disease_name = str(item.get("disease") or "").strip()
        if not disease_name:
            continue
        confidence = float(item.get("confidence") or 0)
        created_raw = item.get("created_at")
        created_at = None
        if created_raw:
            try:
                created_at = datetime.fromisoformat(str(created_raw).replace("Z", "+00:00"))
            except Exception:
                created_at = None
        diagnosis_id = save_prediction(
            disease_name=disease_name,
            confidence=confidence,
            user_id=user_id,
            image_path=item.get("image_path"),
            notes=item.get("status") or "in_progress",
            created_at=created_at,
        )
        if diagnosis_id:
            inserted += 1
    return inserted



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
        traceback.print_exc()
        if conn:
            conn.rollback()
        return 0
    finally:
        if conn:
            return_db_connection(conn)
