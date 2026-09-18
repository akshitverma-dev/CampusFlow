import asyncio
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.responses import RedirectResponse
from sqlalchemy import select, text
from sqlalchemy.orm import Session

import crud
import models
import schemas
from ai_parser import parse_email_to_task
from database import Base, SessionLocal, engine, settings, get_db
from gmail_service import create_authorization_url, exchange_code, fetch_all_messages

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def create_access_token(user_id: int) -> str:
    expires = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode({"sub": str(user_id), "exp": expires}, settings.secret_key, algorithm="HS256")


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)) -> models.User:
    credentials_error = HTTPException(status_code=401, detail="Invalid or expired authentication token", headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        user_id = int(payload.get("sub", ""))
    except (JWTError, ValueError):
        raise credentials_error
    user = db.get(models.User, user_id)
    if not user:
        raise credentials_error
    return user


async def urgency_worker() -> None:
    while True:
        db = SessionLocal()
        try:
            crud.flag_urgent_tasks(db)
        finally:
            db.close()
        await asyncio.sleep(900)


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS gmail_refresh_token TEXT"))
        connection.execute(text("ALTER TABLE emails ADD COLUMN IF NOT EXISTS external_id VARCHAR(255)"))
        connection.execute(text("ALTER TABLE emails ADD COLUMN IF NOT EXISTS parser_checked BOOLEAN NOT NULL DEFAULT FALSE"))
    worker = asyncio.create_task(urgency_worker())
    yield
    worker.cancel()
    try:
        await worker
    except asyncio.CancelledError:
        pass


app = FastAPI(title="CampusFlow API", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=[settings.frontend_origin], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/auth/register", response_model=schemas.TokenResponse, status_code=201)
def register(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, payload.email):
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    user = crud.create_user(db, payload.email, pwd_context.hash(payload.password))
    return {"access_token": create_access_token(user.id), "user": user}


@app.post("/api/auth/login", response_model=schemas.TokenResponse)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, payload.email)
    if not user or not pwd_context.verify(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    return {"access_token": create_access_token(user.id), "user": user}


@app.post("/api/emails/sync", response_model=schemas.SyncResponse)
async def sync_emails(payload: schemas.SyncRequest, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not payload.emails:
        raise HTTPException(status_code=400, detail="Provide at least one email to sync")
    created: list[models.Task] = []
    for email in payload.emails:
        crud.create_email(db, current_user.id, email)
        try:
            extracted = await parse_email_to_task(email.raw_body)
        except RuntimeError as exc:
            db.rollback()
            raise HTTPException(status_code=503, detail=str(exc))
        if extracted.is_task and extracted.title:
            due_date = extracted.due_date
            urgency = extracted.urgency if extracted.urgency in {"low", "normal", "high", "critical"} else "normal"
            created.append(crud.create_task_from_data(db, current_user.id, {"title": extracted.title, "description": extracted.description or None, "course_code": extracted.course_code, "due_date": due_date, "status": "pending", "urgency": urgency}))
    db.commit()
    return {"processed": len(payload.emails), "created_tasks": created}


@app.get("/api/integrations/gmail/authorize")
def gmail_authorize(current_user: models.User = Depends(get_current_user)):
    state = jwt.encode({"sub": str(current_user.id), "purpose": "gmail", "exp": datetime.now(timezone.utc) + timedelta(minutes=10)}, settings.secret_key, algorithm="HS256")
    try:
        return {"authorization_url": create_authorization_url(state)}
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))


@app.get("/api/integrations/gmail/callback")
def gmail_callback(code: str | None = None, state: str | None = None, error: str | None = None, db: Session = Depends(get_db)):
    destination = f"{settings.frontend_origin}/settings?gmail={'error' if error else 'connected'}"
    if error or not code or not state:
        return RedirectResponse(destination)
    try:
        payload = jwt.decode(state, settings.secret_key, algorithms=["HS256"])
        if payload.get("purpose") != "gmail":
            raise ValueError("Invalid OAuth state")
        user = db.get(models.User, int(payload["sub"]))
        if not user:
            raise ValueError("User not found")
        user.gmail_refresh_token = exchange_code(code, state)
        db.commit()
    except (JWTError, ValueError, RuntimeError):
        destination = f"{settings.frontend_origin}/settings?gmail=error"
    return RedirectResponse(destination)


@app.get("/api/integrations/gmail/status")
def gmail_status(current_user: models.User = Depends(get_current_user)):
    return {"connected": bool(current_user.gmail_refresh_token)}


@app.post("/api/integrations/gmail/sync", response_model=schemas.SyncResponse)
async def gmail_sync(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.gmail_refresh_token:
        raise HTTPException(status_code=400, detail="Connect your Gmail account first")
    try:
        messages = await asyncio.to_thread(fetch_all_messages, current_user.gmail_refresh_token, 5)
    except Exception as exc:
        if "quotaExceeded" in str(exc) or "Quota exceeded" in str(exc):
            raise HTTPException(status_code=429, detail="Gmail quota is temporarily exhausted. Wait a few minutes, then sync again.")
        raise HTTPException(status_code=502, detail=f"Gmail sync failed: {exc}")
    created: list[models.Task] = []
    for message in messages:
        existing = db.scalar(select(models.Email).where(models.Email.user_id == current_user.id, models.Email.external_id == message["external_id"]))
        if existing and existing.parser_checked:
            continue
        email = existing or models.Email(user_id=current_user.id, raw_body=message["raw_body"], sender=message["sender"], timestamp=message["timestamp"], external_id=message["external_id"])
        if not existing:
            db.add(email)
        if settings.gemini_api_key and message["raw_body"]:
            try:
                extracted = await parse_email_to_task(f"Subject: {message['subject']}\nFrom: {message['sender']}\n\n{message['raw_body']}")
            except Exception as exc:
                raise HTTPException(status_code=502, detail=f"Gemini parsing failed: {exc}")
            email.parser_checked = True
            if extracted.is_task and extracted.title:
                urgency = extracted.urgency if extracted.urgency in {"low", "normal", "high", "critical"} else "normal"
                created.append(crud.create_task_from_data(db, current_user.id, {"title": extracted.title, "description": extracted.description or None, "course_code": extracted.course_code, "due_date": extracted.due_date, "status": "pending", "urgency": urgency}))
    db.commit()
    return {"processed": len(messages), "created_tasks": created}


@app.get("/api/tasks", response_model=list[schemas.TaskResponse])
def tasks(course_code: str | None = Query(default=None), status_filter: str | None = Query(default=None, alias="status"), current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.list_tasks(db, current_user.id, course_code, status_filter)


@app.post("/api/tasks", response_model=schemas.TaskResponse, status_code=201)
def create_task(payload: schemas.TaskCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.create_task(db, current_user.id, payload)


@app.patch("/api/tasks/{task_id}", response_model=schemas.TaskResponse)
def update_task(task_id: int, payload: schemas.TaskUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = crud.get_task(db, current_user.id, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return crud.update_task(db, task, payload)


@app.delete("/api/tasks/{task_id}", status_code=204)
def delete_task(task_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = crud.get_task(db, current_user.id, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    crud.delete_task(db, task)


@app.get("/api/calendar", response_model=list[schemas.EventResponse])
def calendar(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.list_events(db, current_user.id)
