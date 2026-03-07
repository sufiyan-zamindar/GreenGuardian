---
name: greenguardian-debugging
description: 'Systematic debugging checklist for GreenGiardian plant health diagnosis app. Use when: troubleshooting API endpoints, model predictions, frontend bugs, database connection issues, or Docker configuration problems.'
argument-hint: 'Describe the issue you are debugging'
---

# GreenGiardian Debugging Checklist

## When to Use

- API endpoints returning errors or unexpected responses
- Model predictions failing or producing incorrect diagnoses
- Frontend UI not displaying data correctly
- Database connection or data integrity issues
- Docker containers failing to start or communicate
- Service-to-service communication problems
- Data processing pipeline issues

## Quick Diagnostic Checklist

### 1. **Identify the Component**
   - [ ] Is the issue in frontend (HTML/JS), backend (Python/FastAPI), or AI model?
   - [ ] Check browser console for frontend errors (`F12` → Console tab)
   - [ ] Check backend logs: `docker logs backend` or terminal output
   - [ ] Check model service logs: `docker logs <model-service>` (if containerized)

### 2. **Backend API Health**
   - [ ] Health check endpoint responding? (`GET /health` or startup logs)
   - [ ] Port correct? (Default: 8000 for FastAPI)
   - [ ] Required environment variables set? (Check `.env`, `docker-compose.yml`)
   - [ ] Database connection active? (Check `Backend/app/database/db.py`)
   - [ ] Recent code changes compile? (Python syntax errors in imports)

### 3. **Model & Prediction Issues**
   - [ ] Model file exists at `ai_model/models/greenguardian_model.h5`?
   - [ ] Class labels loaded from `ai_model/models/class_labels.json`?
   - [ ] Input image preprocessing correct? (Check `ai_model/preprocessing/`)
   - [ ] Model predictions endpoint called correctly?
   - [ ] Test with `Backend/app/services/test_prediction.py`

### 4. **Frontend Issues**
   - [ ] Static files served correctly? (Check `frontend/` files in nginx config)
   - [ ] API endpoint URLs hardcoded correctly? (Check `frontend/app.js`)
   - [ ] Service worker cached stale assets? (Clear cache in DevTools → Application)
   - [ ] Required manifest loaded? (`frontend/manifest.json`)

### 5. **Database Issues**
   - [ ] Database migrations applied? Check `database/migrations/`
   - [ ] Database schema matches models? See `database/schema/`
   - [ ] Connection string valid? (Check `Backend/app/database/db.py`)
   - [ ] Tables exist with correct structure? (`description`, `history` tables for diagnosis/history routes)

### 6. **Docker & Environment**
   - [ ] All containers running? (`docker ps` or `docker-compose ps`)
   - [ ] Ports exposed correctly in `docker-compose.yml`?
   - [ ] Volume mounts correct? (Model files, database files)
   - [ ] Network connectivity between services? (Use service names in connection strings)
   - [ ] `.env` file present with required variables?

### 7. **Data & Dataset Issues**
   - [ ] Training/validation data in correct splits? (`dataset/splits/train/`, `/validation/`, `/test/`)
   - [ ] Image preprocessing consistent? (Size, normalization, color channels)
   - [ ] Class labels match between training and inference?
   - [ ] Seed data loaded? (`database/seeds/`)

## Debugging Steps by Symptom

| Symptom | First Check | Command |
|---------|-------------|---------|
| **"Connection refused"** | Backend running? | `docker-compose ps` or `netstat -an \| findstr :8000` |
| **"Model not found"** | Model file exists? | `ls ai_model/models/` (or PowerShell: `ls ai_model\models\`) |
| **"Database error"** | DB running & migrated? | `docker logs db` and check `database/migrations/` |
| **"Blank page"** | Static files served? | Browser DevTools → Network tab, check 404s |
| **"Wrong prediction"** | Model input format? | Run `Backend/app/services/test_prediction.py` with sample image |
| **"Timeout"** | Services slow/hanging? | Check logs and resource usage: `docker stats` |

## Recovery Steps

1. **Clear Docker state**: `docker-compose down && docker-compose up -d`
2. **Rebuild images**: `docker-compose build --no-cache`
3. **Clear cache**: Service worker and browser cache (DevTools → Application)
4. **Reset database**: Drop and recreate schema from `database/schema/`
5. **Check logs comprehensively**: `docker-compose logs -f` (all services)
6. **Verify file permissions**: Especially in mounted volumes and model directories

## Related Tools & Logs

- **Backend logs**: `Backend/app/services/` service files have logging statements
- **Model testing**: `Backend/app/services/test_prediction.py`
- **Docker logs**: `docker-compose logs <service-name>`
- **Database schema**: `database/schema/` for structure validation
- **API docs**: FastAPI auto-generated docs at `http://localhost:8000/docs`
