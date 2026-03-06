from app.database.db import get_db_connection

def get_treatment(disease_name):

    conn = get_db_connection()
    cur = conn.cursor()

    query = """
    SELECT
        dp.symptoms,
        dp.organic_remedies,
        dp.chemical_treatments,
        dp.preventive_measures
    FROM diseases d
    JOIN disease_profiles dp ON dp.disease_id = d.id
    WHERE LOWER(d.disease_name) = LOWER(%s)
    """

    cur.execute(query, (disease_name,))
    result = cur.fetchone()

    cur.close()
    conn.close()

    if result:
        return {
            "symptoms": result[0],
            "organic_treatment": result[1],
            "chemical_treatment": result[2],
            "prevention": result[3]
        }

    return {
        "symptoms": "Information not available",
        "organic_treatment": "Consult agricultural expert",
        "chemical_treatment": "Use recommended fungicide",
        "prevention": "Maintain crop hygiene"
    }