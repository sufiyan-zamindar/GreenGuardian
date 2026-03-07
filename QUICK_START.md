# 🌿 GreenGuardian Quick Start Guide

## ⚡ 30-Second Setup

### Step 1: Run Backend
Double-click this file:
```
D:\GreenGuardian\RUN_BACKEND.bat
```

A Command window will open. You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

**Keep this window open!**

---

### Step 2: Open Frontend
Open your web browser and go to:
```
http://localhost:3000
```

Or if you're using Live Server in VS Code:
- Right-click `D:\GreenGiardian\frontend\index.html`
- Click "Open with Live Server"

---

### Step 3: Use the App
1. **Sign In** with any email/password (e.g., test@example.com / test123)
2. **Upload or drag** a plant image
3. **Click "Analyze Plant"**
4. **Get disease diagnosis** with treatment recommendations

---

## 🔧 If You Get "Failed to Analyze" Error

### ✓ Quick Fix Checklist

1. **Is the backend running?**
   - Look for the black Command window with "Uvicorn running" message
   - If not, double-click `RUN_BACKEND.bat`

2. **Is the backend responding?**
   - Open another Command/PowerShell window
   - Type: `curl http://localhost:8000/`
   - Should see: `{"status":"running",...}`
   - If nothing happens, backend is not running

3. **Is the frontend pointing to the right API?**
   - Open browser console: Press `F12`
   - Go to **Console** tab
   - Upload an image and look for errors
   - You should see: `API request: http://localhost:8000/api/diagnose`

4. **Is the model file present?**
   - Check: `D:\GreenGiardian\ai_model\models\greenguardian_model.h5`
   - Should be a large file (~40+ MB)

---

## 📋 What Each Window Should Show

### Backend Window (Keep Open)
```
INFO:     Started server process [1234]
INFO:     Waiting for application startup.
INFO:     Application startup complete
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started server process [5678]

[Then after uploading image, you'll see:]
Processing image: myplant.jpg (size: (256, 256), mode: RGB)
Diagnosis saved: ID=1, Disease=Tomato___Late_blight, Confidence=94.23%
```

### Frontend Browser
```
✅ Login page with email/password fields
✅ After login: Dashboard with image upload area
✅ After upload: Disease diagnosis with confidence % and treatment info
```

---

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| "Connection refused" | Run `RUN_BACKEND.bat` |
| "Port 8000 already in use" | Close other apps or change port in script |
| "Module not found" error | Run: `pip install -r D:\GreenGuardian\requirements.txt` |
| Blank frontend | Clear browser cache (Ctrl+Shift+Del) or try different browser |
| Model loading errors | Verify `ai_model/models/` folder has the .h5 and .json files |

---

## 📱 Access Points

| Service | URL | What It Shows |
|---------|-----|---------------|
| Frontend | http://localhost:3000 | Plant diagnosis interface |
| Backend API | http://localhost:8000 | Health check: `{"status":"running"}` |
| API Docs | http://localhost:8000/docs | Interactive API documentation |

---

## 📞 Advanced Troubleshooting

### Check if port 8000 is in use:
```powershell
netstat -ano | findstr :8000
```

### Kill process using port 8000:
```powershell
taskkill /PID <NUMBER> /F
```

### Run backend with custom port:
```powershell
cd D:\GreenGuardian\Backend
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```
Then update frontend API to: `http://localhost:8001/api`

---

## ✨ Once It's Working

You can:
- 📸 Upload multiple images
- 📊 View diagnosis history
- 🏥 Get detailed treatment recommendations
- 🌱 Save diagn

ostics for later reference

---

## 😊 Need More Help?

Edit this file with your specific error message:
- `D:\GreenGuardian\SETUP_INSTRUCTIONS.md` (Full guide)
- Check backend console window for error messages
- Browser console (F12) for frontend errors

---

**Good luck! 🎉 Start with step 1.**
