import os
import psycopg2
from psycopg2.pool import SimpleConnectionPool
from contextlib import contextmanager

# Database configuration from environment variables
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "greenguardian")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")

# Connection pool
try:
    connection_pool = SimpleConnectionPool(
        1, 5,
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )
    print(f"✓ Database pool initialized: {DB_HOST}:{DB_PORT}/{DB_NAME}")
except Exception as e:
    print(f"✗ Database connection error: {e}")
    connection_pool = None

def get_db_connection():
    """Get a database connection from the pool"""
    if connection_pool is None:
        raise RuntimeError("Database connection pool not initialized")
    return connection_pool.getconn()

def return_db_connection(conn):
    """Return a connection to the pool"""
    if connection_pool:
        connection_pool.putconn(conn)

@contextmanager
def get_db_cursor():
    """Context manager for database operations"""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        yield cursor
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        return_db_connection(conn)

def close_db_pool():
    """Close all connections in the pool"""
    if connection_pool:
        connection_pool.closeall()
        print("✓ Database pool closed")