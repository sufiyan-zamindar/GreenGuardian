@echo off
REM GreenGuardian Backend Startup Script for Windows CMD

echo.
echo ========================================
echo GreenGuardian Backend Startup
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo [OK] Python found: %PYTHON_VERSION%
echo.

REM Navigate to Backend directory
echo Navigating to Backend directory...
cd /d "D:\GreenGiardian\Backend"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to navigate to Backend directory
    pause
    exit /b 1
)
echo [OK] Location: %cd%
echo.

REM Check and activate virtual environment
if exist venv\ (
    echo Virtual environment found, activating...
    call venv\Scripts\activate.bat
    echo [OK] Virtual environment activated
) else (
    echo Virtual environment not found, creating...
    python -m venv venv
    call venv\Scripts\activate.bat
    echo [OK] Virtual environment created and activated
)
echo.

REM Install requirements
echo Checking dependencies...
pip install -q --upgrade pip
if exist ..\requirements.txt (
    pip install -q -r ..\requirements.txt
    echo [OK] Dependencies installed
) else (
    echo [WARNING] requirements.txt not found
)
echo.

REM Check model files
echo Checking model files...
if exist "..\ai_model\models\greenguardian_model.h5" (
    echo [OK] Model file found
) else (
    echo [ERROR] Model file not found at ..\ai_model\models\greenguardian_model.h5
)

if exist "..\ai_model\models\class_labels.json" (
    echo [OK] Labels file found
) else (
    echo [ERROR] Labels file not found at ..\ai_model\models\class_labels.json
)
echo.

echo ========================================
echo Starting Backend Server...
echo ========================================
echo.
echo Server will run on: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo Press Ctrl+C to stop server
echo.

REM Run the backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

pause
