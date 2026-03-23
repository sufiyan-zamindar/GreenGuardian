import os
import sys

# Add the Backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import diagnosis, history, auth
from app.database.db import close_db_pool, get_db_status

# Initialize FastAPI app
app = FastAPI(
    title="GreenGuardian API",
    description="Plant Disease Detection API for Diagnosis & Treatment",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    db_status = get_db_status()
    return {
        "status": "running",
        "service": "GreenGuardian API",
        "version": "1.0.0",
        "database": db_status,
    }


# Include routers
try:
    app.include_router(diagnosis.router, prefix="/api", tags=["Diagnosis"])
    print("[OK] Diagnosis router loaded")
except Exception as e:
    print(f"[ERR] Failed to load diagnosis router: {e}")

try:
    app.include_router(history.router, prefix="/api", tags=["History"])
    print("[OK] History router loaded")
except Exception as e:
    print(f"[ERR] Failed to load history router: {e}")

try:
    app.include_router(auth.router, prefix="/api", tags=["Auth"])
    print("[OK] Auth router loaded")
except Exception as e:
    print(f"[ERR] Failed to load auth router: {e}")


@app.on_event("startup")
async def startup_event():
    print("\n" + "=" * 60)
    print("GreenGuardian API Starting...")
    print("=" * 60)
    print("[OK] API is ready to accept requests")
    print("[INFO] AI model will load on the first diagnosis request")
    print("API Documentation: http://localhost:8000/docs")
    print("=" * 60 + "\n")


@app.on_event("shutdown")
async def shutdown_event():
    print("\n" + "=" * 60)
    print("GreenGuardian API Shutting Down...")
    close_db_pool()
    print("=" * 60 + "\n")
