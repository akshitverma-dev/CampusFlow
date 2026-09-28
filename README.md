# CampusFlow

CampusFlow is an AI-assisted student productivity operating system. It features a 3D Anamorphic Typography and Shard Workspace with real-time academic focus, email-to-coursework task extraction, automated calendar timeline, tiered scanning quotas (Free vs Pro at ₹199/month), integrated banking checkout gateway, and an administrative control panel.

## Features

- **3D Anamorphic Workspace**: Built with Three.js and React Three Fiber, dispersing and assembling panels with true 3D spatial alignment.
- **AI Email-to-Task Extraction**: Ingest coursework emails and automatically extract tasks, due dates, course codes, and urgency levels using Gemini NLP.
- **Subscription Tiers & Daily Scan Quotas**:
  - **Free Tier**: 5 email scans per day with read-only sandbox privacy.
  - **Pro Tier (₹199 / month)**: Up to 20 email scans per day (4x capacity) with priority AI processing.
- **CampusFlow Secure Payment Gateway**: Complete checkout experience supporting UPI (with dynamic QR codes and VPA entry), Credit/Debit cards, and Net Banking.
- **Administrator Console**: Real-time tier toggling, daily scan quota resets, and student directory inspection.

## Repository Layout

- `backend/` FastAPI, SQLAlchemy, PostgreSQL, Passlib, Gemini integration
- `frontend/` Vite React app with Three.js, React Three Fiber, Tailwind CSS, Lucide icons

## Backend Setup

1. Create a PostgreSQL database (e.g. `campusflow`).
2. Copy `backend/.env.example` to `backend/.env` and configure credentials:
   ```bash
   DATABASE_URL=postgresql+psycopg://campusflow:campusflow@localhost:5432/campusflow
   SECRET_KEY=your_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   ```
3. Create a virtual environment and install dependencies:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

The API runs at `http://localhost:8000`.

## Frontend Setup

```bash
cd frontend
npm install
npm run dev -- --host
```

The application runs at `http://localhost:5173`.

## Default Accounts

- **Admin Account**: `admin@campusflow.edu` / `admin12345` (Full admin console, tier overrides, quota resets)
- **Student User**: Register a new student account or sign in to test the Free tier and Payment Gateway upgrade flow.
