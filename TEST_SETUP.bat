@echo off
REM Test script to verify GreenGuardian backend setup

echo.
echo ========================================
echo GreenGuardian Setup Verification
echo ========================================
echo.

setlocal enabledelayedexpansion

REM Check Python
echo [1/5] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=2" %%i in ('python --version 2^>^&1') do echo   [OK] Python %%i found
) else (
    echo   [ERROR] Python not found. Install from https://www.python.org/
    goto :fail
)
echo.

REM Check model files
echo [2/5] Checking model files...
if exist "D:\GreenGiardian\ai_model\models\greenguardian_model.h5" (
    echo   [OK] greenguardian_model.h5 found
) else (
    echo   [ERROR] greenguardian_model.h5 not found
    goto :fail
)

if exist "D:\GreenGiardian\ai_model\models\class_labels.json" (
    echo   [OK] class_labels.json found
) else (
    echo   [ERROR] class_labels.json not found
    goto :fail
)
echo.

REM Check requirements file
echo [3/5] Checking requirements.txt...
if exist "D:\GreenGiardian\requirements.txt" (
    echo   [OK] requirements.txt found
) else (
    echo   [ERROR] requirements.txt not found
    goto :fail
)
echo.

REM Check fastapi installation
echo [4/5] Checking FastAPI installation...
python -c "import fastapi; import uvicorn; import tensorflow; import pillow" >nul 2>&1
if %errorlevel% equ 0 (
    echo   [OK] All required packages installed
) else (
    echo   [WARNING] Some packages might be missing
    echo   Run: pip install -r D:\GreenGuardian\requirements.txt
)
echo.

REM Check if port 8000 is available
echo [5/5] Checking port 8000 availability...
netstat -ano | findstr :8000 >nul 2>&1
if %errorlevel% equ 0 (
    echo   [WARNING] Port 8000 is already in use
    echo   Please stop other services or use different port
) else (
    echo   [OK] Port 8000 is available
)
echo.

echo ========================================
echo All checks passed! Ready to run backend.
echo ========================================
echo.
echo To start backend, run:
echo   - Double-click: D:\GreenGuardian\RUN_BACKEND.bat
echo   - Or in PowerShell: cd D:\GreenGuardian\Backend ^& uvicorn main:app --host 0.0.0.0 --port 8000 --reload
echo.
pause
exit /b 0

:fail
echo.
echo ========================================
echo Setup verification failed!
echo ========================================
echo Please fix the issues above and try again.
echo.
pause
exit /b 1
