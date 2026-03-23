@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

echo.
echo ========================================
echo GreenGuardian Backend Startup
echo ========================================
echo.

set "PYTHON_CMD="
set "PYTHON_ARGS="

if exist "%CD%\venv311\Scripts\python.exe" (
    "%CD%\venv311\Scripts\python.exe" --version >nul 2>&1
    if not errorlevel 1 (
        set "PYTHON_CMD=%CD%\venv311\Scripts\python.exe"
    )
)

if not defined PYTHON_CMD if exist "%CD%\venv\Scripts\python.exe" (
    "%CD%\venv\Scripts\python.exe" --version >nul 2>&1
    if not errorlevel 1 (
        set "PYTHON_CMD=%CD%\venv\Scripts\python.exe"
    )
)

if not defined PYTHON_CMD (
    python --version >nul 2>&1
    if not errorlevel 1 set "PYTHON_CMD=python"
)

if not defined PYTHON_CMD (
    py -3.11 --version >nul 2>&1
    if not errorlevel 1 (
        set "PYTHON_CMD=py"
        set "PYTHON_ARGS=-3.11"
    )
)

if not defined PYTHON_CMD (
    echo [ERROR] No working Python runtime was found.
    echo Repair the local virtual environment or install Python 3.11+, then rerun this script.
    pause
    exit /b 1
)

echo [OK] Using Python command: %PYTHON_CMD% %PYTHON_ARGS%
echo.
echo Installing backend requirements...
%PYTHON_CMD% %PYTHON_ARGS% -m pip install -q -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Dependency installation failed.
    pause
    exit /b 1
)

echo.
echo Starting Backend Server...
echo Server will run on: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo Press Ctrl+C to stop server
echo.

%PYTHON_CMD% %PYTHON_ARGS% -m uvicorn Backend.main:app --host 0.0.0.0 --port 8000 --reload

pause
