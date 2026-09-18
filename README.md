# CampusFlow

CampusFlow is an AI-assisted student productivity workspace. It combines email-to-task extraction with a focused task list, academic calendar, and daily progress view.

## Repository layout

- `backend/` FastAPI, SQLAlchemy, PostgreSQL, Gemini integration
- `frontend/` Vite React app with Tailwind CSS and FullCalendar

## Backend setup

1. Create a PostgreSQL database.
2. Copy `backend/.env.example` to `backend/.env` and configure it.
3. Create a virtual environment and install dependencies:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The API runs at `http://localhost:8000`.

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

For a real email provider, implement the provider-specific fetch in `main.py` or place normalized messages in `POST /api/emails/sync`'s `emails` payload. Gemini parsing is enabled when `GEMINI_API_KEY` is configured; otherwise sync returns a clear configuration error.
