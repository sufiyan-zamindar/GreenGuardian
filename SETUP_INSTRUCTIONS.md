# GreenGuardian Setup & Running Instructions

## ⚙️ System Requirements

- **Python**: 3.8 or higher
- **Node.js**: 14.0 or higher (for frontend)
- **pip**: Latest version
- **RAM**: 4GB minimum (for model inference)

## 📦 Installation

### 1. Install Python Dependencies

Open PowerShell and run:

```powershell
cd D:\GreenGiardian
pip install -r requirements.txt
```

### 2. Install Frontend Dependencies (Optional - if using Node.js)

```powershell
cd D:\GreenGiardian\frontend
npm install
```

## 🚀 Running the Application

### Method 1: Using Provided Scripts (Recommended)

#### Start Backend:
```powershell
# Run from any location, executes the startup script
& 'D:\GreenGiardian\RUN_BACKEND.ps1'
```

#### Start Frontend (if using Node.js server):
```powershell
cd D:\GreenGiardian\frontend
npm start
```

---

### Method 2: Manual Startup

#### Start Backend:
```powershell
cd D:\GreenGiardian\Backend
python -m venv venv                    # Create virtual environment (first time only)
.\venv\Scripts\Activate.ps1            # Activate virtual environment
pip install -r ..\requirements.txt     # Install dependencies (first time only)
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### Start Frontend:
```powershell
# If using Live Server extension in VS Code
# Right-click index.html → Open with Live Server

# OR using Python's built-in server
cd D:\GreenGiardian\frontend
python -m http.server 3000
```

---

## 🔗 Access Points

Once everything is running:

- **Frontend**: http://localhost:3000 (or your Live Server port)
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/

---

## ⚠️ Common Issues & Fixes

### Issue 1: "Failed to analyze plant image" Error

**Causes:**
- Backend not running
- API endpoint unreachable
- Model files missing

**Fix:**
1. Check backend is running on port 8000:
```powershell
# Open new PowerShell window and test:
curl http://localhost:8000/
```

2. If curl returns an error, start backend:
```powershell
& 'D:\GreenGiardian\RUN_BACKEND.ps1'
```

3. Verify model files exist:
```powershell
Test-Path D:\GreenGiardian\ai_model\models\greenguardian_model.h5
Test-Path D:\GreenGiardian\ai_model\models\class_labels.json
```

---

### Issue 2: ModuleNotFoundError (Missing Dependencies)

**Fix:**
```powershell
cd D:\GreenGiardian
pip install --upgrade pip
pip install -r requirements.txt
```

---

### Issue 3: Port Already in Use

**Backend Port 8000 in use:**
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# OR use different port
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

---

### Issue 4: CORS Errors in Frontend

**Fix:**
Backend already has CORS enabled. If still seeing errors:
- Clear browser cache (Ctrl+Shift+Del)
- Try different browser
- Check browser console (F12) for actual error message

---

## 📊 API Endpoints

### Diagnose Plant Disease
**POST** `/api/diagnose`

Request:
```
Content-Type: multipart/form-data
Body: file (image file)
```

Response:
```json
{
  "success": true,
  "disease": "Tomato___Late_blight",
  "confidence": 0.94,
  "confidence_percentage": 94,
  "treatment": {...}
}
```

### Get History
**GET** `/api/history`

Response:
```json
{
  "diagnoses": [
    {
      "id": 1,
      "disease": "Tomato___Late_blight",
      "confidence": 0.94,
      "created_at": "2026-03-07T10:30:00"
    }
  ]
}
```

---

## 🧪 Testing

### Test Backend Connection:
```powershell
# Health check
curl http://localhost:8000/

# API docs
Start-Process "http://localhost:8000/docs"
```

### Test Image Upload:
Use the frontend UI or:
```powershell
$filePath = "C:\path\to\image.jpg"
$uri = "http://localhost:8000/api/diagnose"

$form = @{
    file = Get-Item -Path $filePath
}

Invoke-WebRequest -Uri $uri -Method Post -Form $form
```

---

## 📝 Troubleshooting Checklist

- [ ] Python 3.8+ is installed: `python --version`
- [ ] Backend dependencies installed: `pip list | grep fastapi`
- [ ] Model files exist in `ai_model/models/`
- [ ] Backend running: `curl http://localhost:8000/`
- [ ] API responding: Check http://localhost:8000/docs
- [ ] Frontend can access API: Check browser console (F12)
- [ ] Images are in supported format (JPG, PNG, WEBP)
- [ ] Image file size is reasonable (< 10MB)

---

## 🔍 Debug Mode

Enable detailed logging:

```powershell
cd D:\GreenGiardian\Backend
$env:LOG_LEVEL = "DEBUG"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload --log-level debug
```

---

## 💡 Next Steps

1. Start backend using `RUN_BACKEND.ps1`
2. Open frontend in browser
3. Log in (any email/password)
4. Upload a plant image
5. See disease diagnosis and treatment recommendations

For issues, check backend logs in the terminal where `uvicorn` is running.
