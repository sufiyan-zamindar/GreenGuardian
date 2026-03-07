import os
import sys
import json
from pathlib import Path

# Add the Backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import diagnosis, history
from app.database.db import close_db_pool

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

# Health check endpoint
@app.get("/")
def health_check():
    return {
        "status": "running",
        "service": "GreenGuardian API",
        "version": "1.0.0"
    }

# Include routers
try:
    app.include_router(diagnosis.router, prefix="/api", tags=["Diagnosis"])
    print("✓ Diagnosis router loaded")
except Exception as e:
    print(f"✗ Failed to load diagnosis router: {e}")

try:
    app.include_router(history.router, prefix="/api", tags=["History"])
    print("✓ History router loaded")
except Exception as e:
    print(f"✗ Failed to load history router: {e}")

# Startup event
@app.on_event("startup")
async def startup_event():
    print("\n" + "="*60)
    print("🌿 GreenGuardian API Starting...")
    print("="*60)
    try:
        from app.services.prediction_service import model, class_names
        print("✓ AI Model loaded successfully")
        print(f"  - Classes available: {len(class_names)}")
    except Exception as e:
        print(f"✗ Warning: AI Model not available: {e}")
    
    print("✓ API is ready to accept requests")
    print("📍 API Documentation: http://localhost:8000/docs")
    print("="*60 + "\n")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    print("\n" + "="*60)
    print("🌿 GreenGuardian API Shutting Down...")
    close_db_pool()
    print("="*60 + "\n")
