# GreenGuardian Backend Startup Script for Windows PowerShell

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

Write-Host "========================================" -ForegroundColor Green
Write-Host "GreenGuardian Backend Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$pythonCommand = $null
$pythonArgs = @()
$candidates = @(
    @{ Label = "project venv311"; Command = (Join-Path $projectRoot "venv311\Scripts\python.exe"); Args = @() },
    @{ Label = "project venv"; Command = (Join-Path $projectRoot "venv\Scripts\python.exe"); Args = @() },
    @{ Label = "python"; Command = "python"; Args = @() },
    @{ Label = "py"; Command = "py"; Args = @("-3.11") }
)

foreach ($candidate in $candidates) {
    try {
        if ($candidate.Command -like "*.exe" -and -not (Test-Path $candidate.Command)) {
            continue
        }
        & $candidate.Command @($candidate.Args + "--version") | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $pythonCommand = $candidate.Command
            $pythonArgs = $candidate.Args
            Write-Host "Using $($candidate.Label): $($candidate.Command)" -ForegroundColor Green
            break
        }
    } catch {
        continue
    }
}

if (-not $pythonCommand) {
    Write-Host "No working Python runtime was found." -ForegroundColor Red
    Write-Host "Install Python 3.11+ or repair the local virtual environment, then rerun this script." -ForegroundColor Red
    exit 1
}

Write-Host "Installing backend requirements..." -ForegroundColor Yellow
& $pythonCommand @($pythonArgs + "-m", "pip", "install", "-q", "-r", "requirements.txt")
if ($LASTEXITCODE -ne 0) {
    Write-Host "Dependency installation failed." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting backend server on http://localhost:8000" -ForegroundColor Yellow
Write-Host "API docs: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop server" -ForegroundColor Yellow
Write-Host ""

& $pythonCommand @($pythonArgs + "-m", "uvicorn", "Backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload")
