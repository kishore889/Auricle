# AURICLE Backend (FastAPI Gateway)

AI-Assisted Hearing and Cochlear-Inspired Stimulation Research Prototype Backend.

---

## Technical Stack (Phase B0 Foundation)

- **Python**: 3.10+ (Tested on Python 3.14)
- **Framework**: FastAPI
- **Server**: Uvicorn
- **Configuration**: Pydantic Settings
- **Testing**: pytest + HTTPX / TestClient

---

## Project Structure

```text
backend/
├── app/
│   ├── main.py              # FastAPI application entrypoint & middleware
│   ├── api/
│   │   ├── router.py        # Central API router
│   │   └── routes/
│   │       └── health.py    # Health check route (GET /health)
│   └── core/
│       ├── config.py        # Pydantic Settings configuration
│       ├── exceptions.py    # Standardized error handling
│       └── logging.py       # Structured logger
├── tests/
│   ├── conftest.py          # Pytest fixtures
│   ├── test_health.py       # Health check tests
│   └── test_cors.py         # CORS tests
├── .env.example             # Template environment variables
├── .gitignore
├── requirements.txt         # Phase B0 Python dependencies
└── README.md
```

---

## Setup & Running Locally

### 1. Environment Setup
```powershell
cd backend
py -m venv venv
.\venv\Scripts\Activate.ps1
```

### 2. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```powershell
cp .env.example .env
```

### 4. Run Development Server
```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Access:
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health) or [http://localhost:8000/api/health](http://localhost:8000/api/health)
- **OpenAPI Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## Running Automated Tests

```powershell
pytest
```
