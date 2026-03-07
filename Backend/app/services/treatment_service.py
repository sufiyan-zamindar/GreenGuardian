from app.database.db import get_db_connection, return_db_connection

def get_treatment(disease_name):
    """Get treatment information for a disease"""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
        SELECT
            dp.symptoms,
            dp.organic_remedies,
            dp.chemical_treatments,
            dp.preventive_measures,
            dp.severity_level
        FROM diseases d
        JOIN disease_profiles dp ON dp.disease_id = d.id
        WHERE LOWER(d.disease_name) = LOWER(%s)
        """

        cursor.execute(query, (disease_name,))
        result = cursor.fetchone()
        cursor.close()

        if result:
            return {
                "symptoms": result[0],
                "organic_treatment": result[1],
                "chemical_treatment": result[2],
                "prevention": result[3],
                "severity": result[4] or "Unknown"
            }

        return {
            "symptoms": "Information not available",
            "organic_treatment": "Consult agricultural expert",
            "chemical_treatment": "Use recommended fungicide",
            "prevention": "Maintain crop hygiene",
            "severity": "Unknown"
        }
    except Exception as e:
        print(f"Error fetching treatment: {e}")
        return {
            "symptoms": "Error fetching information",
            "organic_treatment": "Please try again",
            "chemical_treatment": "Please try again",
            "prevention": "Please try again",
            "severity": "Unknown"
        }
    finally:
        if conn:
            return_db_connection(conn)