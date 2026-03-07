# GreenGuardian - Setup & Installation Guide

## Overview

GreenGuardian is an AI-powered plant disease detection system with:
- **Backend**: FastAPI + PostgreSQL
- **Frontend**: HTML5 + JavaScript PWA
- **AI Model**: TensorFlow/Keras with MobileNetV2
- **Containerization**: Docker & Docker Compose

## Prerequisites

### Option 1: Docker (Recommended)
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose (included with Docker Desktop)

### Option 2: Local Development
- Python 3.11+
- PostgreSQL 13+
- Node.js 16+ (optional, for frontend development)

## Quick Start (Docker)

### 1. Clone and Navigate
```bash
cd d:\GreenGiardian
```

### 2. Build and Run
```bash
docker-compose up -d
```

### 3. Initialize Database
Run the SQL scripts to create tables and seed data:
```bash
docker-compose exec db psql -U postgres -d greenguardian -f /docker-entrypoint-initdb.d/01-schema/01_initial_schema.sql
docker-compose exec db psql -U postgres -d greenguardian -f /docker-entrypoint-initdb.d/02-seeds/01_disease_data.sql
```

### 4. Access the Application
- **Frontend**: http://localhost
- **API Docs**: http://localhost:8000/docs
- **Backend Health**: http://localhost:8000/

## Local Development Setup

### 1. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 2. Setup PostgreSQL Database
```bash
# Create database
createdb greenguardian

# Create tables
psql -U postgres -d greenguardian -f database/schema/01_initial_schema.sql

# Seed disease data
psql -U postgres -d greenguardian -f database/seeds/01_disease_data.sql
```

### 3. Configure Environment
Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your local settings:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=greenguardian
DB_USER=postgres
DB_PASSWORD=postgres
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
ENVIRONMENT=development
```

### 4. Run Backend
```bash
cd Backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: http://localhost:8000

### 5. Run Frontend (Development)
```bash
# Simple HTTP server (Python 3)
cd frontend
python -m http.server 8080
```

Frontend will be available at: http://localhost:8080

## Project Structure

```
GreenGuardian/
├── Backend/                           # FastAPI backend
│   ├── main.py                       # Application entry point
│   ├── app/
│   │   ├── database/db.py            # Database connection pool
│   │   ├── models/                   # SQLAlchemy models (optional)
│   │   ├── routes/
│   │   │   ├── diagnosis.py          # Disease diagnosis endpoint
│   │   │   └── history.py            # Diagnosis history endpoint
│   │   ├── services/
│   │   │   ├── prediction_service.py # ML model inference
│   │   │   ├── treatment_service.py  # Treatment lookup
│   │   │   └── history_service.py    # History management
│   │   └── schemas/                  # Pydantic schemas
│   └── tests/
│
├── frontend/                          # Static frontend files
│   ├── index.html                    # Main HTML page
│   ├── app.js                        # Application logic
│   ├── manifest.json                 # PWA manifest
│   └── sw.js                         # Service worker
│
├── ai_model/                         # ML model & training
│   └── models/
│       ├── greenguardian_model.h5    # Pre-trained Keras model
│       └── class_labels.json         # Disease class labels
│
├── database/                         # Database files
│   ├── schema/
│   │   └── 01_initial_schema.sql     # Table definitions
│   └── seeds/
│       └── 01_disease_data.sql       # Sample disease data
│
├── docker/                           # Container configuration
│   ├── backend/
│   │   └── Dockerfile               # Backend container
│   └── nginx/
│       └── nginx.conf               # Nginx web server config
│
├── docker-compose.yml                # Container orchestration
├── requirements.txt                  # Python dependencies
├── .env.example                      # Environment variables template
└── README.md                         # Project documentation
```

## API Documentation

### Health Check
```
GET /
Response: { "status": "running", "service": "GreenGuardian API", "version": "1.0.0" }
```

### Diagnose Plant
```
POST /api/diagnose
Content-Type: multipart/form-data

Body: file (image)

Response:
{
  "success": true,
  "disease": "Tomato Late blight",
  "disease_id": "Tomato_Late_blight",
  "confidence": 0.94,
  "confidence_percentage": 94,
  "treatment": {
    "symptoms": "...",
    "organic_treatment": "...",
    "chemical_treatment": "...",
    "prevention": "..."
  }
}
```

### Get Diagnosis History
```
GET /api/history?user_id=1&limit=10

Response:
{
  "success": true,
  "count": 3,
  "diagnoses": [
    {
      "id": 1,
      "disease": "Tomato Late blight",
      "confidence": 0.94,
      "created_at": "2024-01-15T10:30:00"
    }
  ]
}
```

## Frontend Features

- **Image Upload**: Support for JPG, PNG, and other image formats
- **Real-time Diagnosis**: Instant AI analysis with confidence score
- **Treatment Guide**: Organic and chemical treatment options
- **Prevention Tips**: Disease prevention strategies
- **Diagnosis History**: Track previous diagnoses
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Mode**: Toggle between light and dark themes
- **PWA Support**: Offline-capable progressive web app

## Database Schema

### Tables
- `users` - User accounts
- `diseases` - Disease information
- `disease_profiles` - Treatment & prevention info
- `diagnoses` - Diagnosis records
- `treatments` - Treatment history

All tables have proper foreign keys, indexes, and constraints.

## Troubleshooting

### Docker Issues

**Port already in use:**
```bash
docker-compose down  # Stop all services
docker container prune  # Remove old containers
docker-compose up -d  # Start fresh
```

**Database connection failed:**
```bash
# Check PostgreSQL is running
docker-compose ps

# Check logs
docker-compose logs db

# Restart database
docker-compose restart db
```

**Backend not connecting:**
```bash
# Check backend logs
docker-compose logs backend

# Verify database is ready
docker-compose logs db | grep "database system is ready"
```

### Local Development Issues

**Import errors:**
```bash
pip install -r requirements.txt --upgrade
```

**Database issues:**
```bash
# Reset database
dropdb greenguardian
createdb greenguardian
psql -U postgres -d greenguardian -f database/schema/01_initial_schema.sql
```

**Model not loading:**
- Verify `ai_model/models/greenguardian_model.h5` exists
- Verify `ai_model/models/class_labels.json` exists
- Check file permissions

## Performance Tips

1. **Image Optimization**: Compress images before upload (< 5MB recommended)
2. **Batch Diagnosis**: Send images one at a time for best results
3. **Caching**: Browser caches API responses. Clear cache if needed
4. **Database**: Use PostgreSQL indexes for faster queries

## Security Notes

1. **Environment Variables**: Never commit `.env` file with real credentials
2. **CORS**: Configure `allow_origins` in production to specific domains
3. **Authentication**: Add user authentication before production deployment
4. **Database**: Use strong passwords, restrict access in production
5. **APIs**: Rate limiting and input validation recommended

## Production Deployment

### Using Docker Compose
```bash
# Build production images
docker-compose -f docker-compose.yml build

# Deploy
docker-compose up -d

# Monitor logs
docker-compose logs -f
```

### Using Kubernetes
See `kubernetes/` directory for K8s configuration (if available)

### Environment Variables for Production
```
DB_HOST=prod-db-host
DB_USER=prod_user
DB_PASSWORD=<secure-password>
ENVIRONMENT=production
DEBUG=False
ALLOWED_HOSTS=yourdomain.com
```

## Monitoring

### Docker Stats
```bash
docker stats
```

### Container Logs
```bash
docker-compose logs -f backend    # Backend logs
docker-compose logs -f db         # Database logs
docker-compose logs -f frontend   # Frontend logs
```

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Docker logs: `docker-compose logs`
3. Check API docs: http://localhost:8000/docs
4. Review database schema: `database/schema/01_initial_schema.sql`

## License

This project is provided as-is for educational and commercial use.
