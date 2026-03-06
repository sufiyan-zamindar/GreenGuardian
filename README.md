# 🌱 GreenGuardian - Plant Disease Detection System

**Status:** Fully Functional with Diagnostic Tools

---

## 🚀 START HERE - 3 Easy Steps

### **Step 1: Start Backend** 
```powershell
cd Backend
..\venv\Scripts\activate
python main.py
```

### **Step 2: Start Frontend** (in NEW PowerShell window)
```powershell
cd sufiyan
python -m http.server 3000
```

### **Step 3: Open App**
Go to: **http://localhost:3000/**

---

## ❓ Getting "Failed to Analyze" Error?

### 🎯 **Easiest Fix - Use Diagnostic Menu**
Double-click: **`START.bat`**
- Automatically checks both servers
- Runs full system diagnostic
- Provides clear instructions

### 🔍 **Or Use Web-Based Tools**
After starting both servers, open:

1. **Debug Console** (Recommended)
   - http://localhost:3000/debug_console.html
   - Click "Test Backend Connection"
   - Upload image → Click "Test Diagnose API"
   - See detailed error messages

2. **Advanced Diagnosis Tool**
   - http://localhost:3000/diagnosis.html
   - Click "Run All Tests Now"
   - Manual upload test with detailed output

3. **PowerShell Diagnostic**
   - Run: `diagnose.ps1` in PowerShell
   - Complete system check
   - Identifies exact problem

---

## 🎯 Why "Failed to Analyze" Happens

The error typically means:
- ❌ Backend server not running
- ❌ Frontend can't reach backend (CORS/network issue)  
- ❌ Image upload failing
- ❌ Invalid response from backend

**The diagnostic tools will identify which one!**

---

## 📊 System Architecture

```
Frontend (sufiyan) ←→ Backend API ←→ AI Model
port 3000           port 8000      TensorFlow
(HTTP Server)      (Flask)         (h5 file)
```

---

## 🛠️ Key Files & Tools

| File | Purpose | Access |
|------|---------|--------|
| **START.bat** | Control menu for everything | Double-click |
| **diagnose.ps1** | Full system diagnostic | PowerShell |
| **QUICK_START.md** | Step-by-step guide | Read in editor |
| **debug_console.html** | Web test tool | http://localhost:3000/debug_console.html |
| **diagnosis.html** | Advanced diagnostics | http://localhost:3000/diagnosis.html |

---

## 🔧 Troubleshooting

### Backend Won't Start
```
Error: "python: command not found" or "activate: not found"
→ Run from D:\GreenGiardian\Backend folder
→ Use: ..\venv\Scripts\activate (not just activate)
→ Use: python main.py (not python3)
```

### Port Already In Use
```
Error: "Address already in use" on port 8000 or 3000
→ Kill old processes: Stop-Process -Name python -Force
→ Or change port in code
```

### Can't Import Flask
```
Error: "ModuleNotFoundError: No module named 'flask'"
→ Activate venv: ..\venv\Scripts\activate
→ Install: pip install flask flask-cors
```

### Frontend Shows 404
```
Error: File not found for debug_console.html
→ Make sure server is running from sufiyan folder
→ Access: http://localhost:3000/debug_console.html
```

---

## 📱 Features

- ✅ Upload plant leaf images
- ✅ Real-time disease detection
- ✅ AI-powered predictions
- ✅ Treatment recommendations
- ✅ Full diagnosis history
- ✅ User profiles & settings
- ✅ Offline support (PWA)

---

## 🎓 How It Works

1. **Upload Image** → User selects plant leaf photo
2. **Send to Backend** → Frontend uploads to `/diagnose` endpoint
3. **AI Prediction** → TensorFlow model analyzes image
4. **Return Result** → Backend sends disease name + confidence
5. **Display Treatment** → Frontend shows recommendations

---

## 📞 Need Help?

1. **Check QUICK_START.md** - Detailed troubleshooting
2. **Run diagnose.ps1** - Automatic diagnostic
3. **Use debug_console.html** - Web-based testing
4. **Check browser console** - F12 → Console tab for errors
5. **Check backend terminal** - Error messages there

---

## ✨ System Status Check

Run this in PowerShell to test everything:
```powershell
# Test Backend
Invoke-WebRequest http://localhost:8000 -UseBasicParsing

# Test Frontend  
Invoke-WebRequest http://localhost:3000 -UseBasicParsing

# Both should return HTTP 200
```

---

## 📁 Project Structure

```
D:\GreenGiardian\
├── Backend/                 # Flask API server
│   ├── main.py             # API endpoints
│   ├── app/
│   │   └── services/
│   │       └── prediction_service.py
│   └── requirements.txt
├── sufiyan/                # Frontend PWA
│   ├── index.html
│   ├── app.js
│   ├── debug_console.html  # Debug tool
│   └── diagnosis.html      # Diagnosis tool
├── ai_model/               # TensorFlow model
│   └── models/
│       ├── greenguardian_model.h5
│       └── class_labels.json
├── dataset/                # Training data
├── START.bat              # Easy menu
├── diagnose.ps1           # Diagnostic script
└── QUICK_START.md         # Setup guide
```

---

## 🎯 Next Steps

1. **New user:** Read QUICK_START.md
2. **Getting errors:** Run START.bat
3. **Want details:** Open diagnose.ps1
4. **Testing API:** Use debug_console.html

---

**GreenGuardian v2.0 - Plant Disease Detection Made Easy** 🌿
