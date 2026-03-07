# GreenGuardian Backend Startup Script for Windows PowerShell

Write-Host "========================================" -ForegroundColor Green
Write-Host "GreenGuardian Backend Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if Python is installed
Write-Host "Checking Python installation..." -ForegroundColor Yellow
$pythonCheck = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.8+ from https://www.python.org/" -ForegroundColor Red
    exit
}
Write-Host "✓ Python found: $pythonCheck" -ForegroundColor Green

# Navigate to Backend directory
Write-Host "Navigating to Backend directory..." -ForegroundColor Yellow
$backendPath = "D:\GreenGiardian\Backend"
Set-Location $backendPath
Write-Host "✓ Location: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# Check if virtual environment exists
$venvPath = "$backendPath\venv"
if (Test-Path $venvPath) {
    Write-Host "Virtual environment found, activating..." -ForegroundColor Yellow
    & "$venvPath\Scripts\Activate.ps1"
    Write-Host "✓ Virtual environment activated" -ForegroundColor Green
} else {
    Write-Host "Virtual environment not found" -ForegroundColor Yellow
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    & "$venvPath\Scripts\Activate.ps1"
    Write-Host "✓ Virtual environment created and activated" -ForegroundColor Green
}

Write-Host ""

# Check if requirements are installed
Write-Host "Checking dependencies..." -ForegroundColor Yellow
$requirementsPath = "D:\GreenGiardian\requirements.txt"
if (Test-Path $requirementsPath) {
    Write-Host "Installing requirements from $requirementsPath..." -ForegroundColor Yellow
    pip install -q --upgrade pip
    pip install -q -r $requirementsPath
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠ requirements.txt not found, skipping dependency installation" -ForegroundColor Yellow
}

Write-Host ""

# Check model files
Write-Host "Checking model files..." -ForegroundColor Yellow
$modelPath = "D:\GreenGiardian\ai_model\models\greenguardian_model.h5"
$labelsPath = "D:\GreenGiardian\ai_model\models\class_labels.json"

if (Test-Path $modelPath) {
    $modelSize = (Get-Item $modelPath).Length / 1MB
    Write-Host "✓ Model file found: $modelSize MB" -ForegroundColor Green
} else {
    Write-Host "❌ Model file not found at $modelPath" -ForegroundColor Red
}

if (Test-Path $labelsPath) {
    Write-Host "✓ Labels file found" -ForegroundColor Green
} else {
    Write-Host "❌ Labels file not found at $labelsPath" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Starting Backend Server..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Server will run on: http://localhost:8000" -ForegroundColor Yellow
Write-Host "API Documentation: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop server" -ForegroundColor Yellow
Write-Host ""

# Run the backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
