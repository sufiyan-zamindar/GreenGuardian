import os
from pathlib import Path
from contextlib import contextmanager

import psycopg2
from psycopg2.pool import SimpleConnectionPool
from dotenv import load_dotenv

# Load both project-level and Backend-level .env (Backend overrides root values)
PROJECT_ROOT = Path(__file__).resolve().parents[3]
BACKEND_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(PROJECT_ROOT / ".env")
load_dotenv(BACKEND_ROOT / ".env", override=True)

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "greenguardian")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")

SCHEMA_FILE = PROJECT_ROOT / "database" / "schema" / "01_initial_schema.sql"
SEED_FILE = PROJECT_ROOT / "database" / "seeds" / "01_disease_data.sql"

connection_pool = None
DB_INIT_ERROR = None


def _execute_sql_file(cursor, file_path: Path):
    if not file_path.exists():
        print(f"DB init skipped, file not found: {file_path}")
        return
    sql = file_path.read_text(encoding="utf-8")
    cursor.execute(sql)


def _ensure_schema_and_seed(conn):
    cursor = conn.cursor()
    try:
        # Compatibility migrations for legacy schemas should run first,
        # so later schema/index SQL won't fail on missing created_at columns.
        compatibility_sql = [
            "ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE IF EXISTS diseases ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE IF EXISTS disease_profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE IF EXISTS diagnoses ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE IF EXISTS treatments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE IF EXISTS treatments ADD COLUMN IF NOT EXISTS applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        ]
        for stmt in compatibility_sql:
            cursor.execute(stmt)
        conn.commit()

        required_tables = ["users", "diseases", "disease_profiles", "diagnoses", "treatments"]
        cursor.execute(
            """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = ANY(%s)
            """,
            (required_tables,),
        )
        existing = {row[0] for row in cursor.fetchall()}
        missing = [t for t in required_tables if t not in existing]

        if missing:
            print(f"DB schema incomplete. Missing tables: {', '.join(missing)}. Applying schema SQL...")
            _execute_sql_file(cursor, SCHEMA_FILE)
            conn.commit()

        # Re-run compatibility after schema creation to cover newly-created/partially-created tables.
        for stmt in compatibility_sql:
            cursor.execute(stmt)
        conn.commit()

        cursor.execute("SELECT COUNT(*) FROM diseases")
        disease_count = int(cursor.fetchone()[0])

        if disease_count == 0:
            print("Disease seed data missing. Applying seed SQL...")
            try:
                _execute_sql_file(cursor, SEED_FILE)
                conn.commit()
            except Exception as seed_err:
                conn.rollback()
                print(f"Disease seed skipped due to error: {seed_err}")

    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()


try:
    connection_pool = SimpleConnectionPool(
        1,
        5,
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
    )
    print(f"Database pool initialized: {DB_HOST}:{DB_PORT}/{DB_NAME}")

    init_conn = connection_pool.getconn()
    try:
        _ensure_schema_and_seed(init_conn)
    finally:
        connection_pool.putconn(init_conn)

except Exception as e:
    print(f"Database connection error: {e}")
    DB_INIT_ERROR = str(e)
    connection_pool = None


def get_db_connection():
    if connection_pool is None:
        raise RuntimeError("Database connection pool not initialized")
    return connection_pool.getconn()


def return_db_connection(conn):
    if connection_pool:
        connection_pool.putconn(conn)


@contextmanager
def get_db_cursor():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        yield cursor
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        return_db_connection(conn)


def close_db_pool():
    if connection_pool:
        connection_pool.closeall()
        print("Database pool closed")


def get_db_status():
    if connection_pool is None:
        return {
            "connected": False,
            "error": DB_INIT_ERROR or "Database connection pool not initialized",
            "host": DB_HOST,
            "port": DB_PORT,
            "database": DB_NAME,
            "user": DB_USER,
        }

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        cursor.close()
        return {
            "connected": True,
            "error": None,
            "host": DB_HOST,
            "port": DB_PORT,
            "database": DB_NAME,
            "user": DB_USER,
        }
    except Exception as e:
        return {
            "connected": False,
            "error": str(e),
            "host": DB_HOST,
            "port": DB_PORT,
            "database": DB_NAME,
            "user": DB_USER,
        }
    finally:
        if conn:
            return_db_connection(conn)
