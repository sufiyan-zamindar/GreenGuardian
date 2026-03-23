from app.database.db import get_db_connection, return_db_connection
from app.services.disease_name_service import find_disease_record
from app.services.severity_service import resolve_severity


def _healthy_fallback():
    return {
        "symptoms": "No visible disease symptoms detected",
        "organic_treatment": "No treatment needed. Continue regular care",
        "chemical_treatment": "No treatment required",
        "prevention": "Maintain good watering, nutrition, and monitoring",
        "severity": "none"
    }


def get_treatment(disease_name):
    """Get treatment information for a disease"""
    if "healthy" in str(disease_name).lower():
        return _healthy_fallback()

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        disease_record = find_disease_record(cursor, disease_name)
        if not disease_record:
            return {
                "symptoms": "Information not available for this disease yet",
                "organic_treatment": "Consult agricultural expert",
                "chemical_treatment": "Use recommended fungicide",
                "prevention": "Maintain crop hygiene and monitor plant regularly",
                "severity": resolve_severity(None, disease_name)
            }

        disease_id = disease_record[0]

        query = """
        SELECT
            dp.symptoms,
            dp.organic_remedies,
            dp.chemical_treatments,
            dp.preventive_measures,
            COALESCE(dp.severity_level, 'Unknown')
        FROM disease_profiles dp
        WHERE dp.disease_id = %s
        """

        cursor.execute(query, (disease_id,))
        result = cursor.fetchone()
        cursor.close()

        if result:
            return {
                "symptoms": result[0] or "Information not available",
                "organic_treatment": result[1] or "Consult agricultural expert",
                "chemical_treatment": result[2] or "Use recommended fungicide",
                "prevention": result[3] or "Maintain crop hygiene",
                "severity": resolve_severity(result[4], disease_name)
            }

        return {
            "symptoms": "Profile not found in disease database",
            "organic_treatment": "Consult agricultural expert",
            "chemical_treatment": "Use recommended fungicide",
            "prevention": "Maintain crop hygiene and monitor plant regularly",
            "severity": resolve_severity(None, disease_name)
        }

    except Exception as e:
        print(f"Error fetching treatment: {e}")
        return {
            "symptoms": "Treatment lookup unavailable (database connection issue)",
            "organic_treatment": "Check database connection and retry",
            "chemical_treatment": "Check database connection and retry",
            "prevention": "Ensure PostgreSQL is running and seeded",
            "severity": resolve_severity(None, disease_name)
        }
    finally:
        if conn:
            return_db_connection(conn)


