import psycopg2

def get_db_connection():
    conn = psycopg2.connect(
        host="localhost",
        database="Greengiardian",
        user="postgres",
        password="Sufiyan123"
    )
    return conn