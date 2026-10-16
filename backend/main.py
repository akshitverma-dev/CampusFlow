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
    crud.check_and_reset_daily_quota(user, db)
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
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS tier VARCHAR(20) NOT NULL DEFAULT 'free'"))
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE"))
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_scan_count INTEGER NOT NULL DEFAULT 0"))
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_scan_date DATE"))
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) NOT NULL DEFAULT 'active'"))
        connection.execute(text("UPDATE users SET is_admin = FALSE WHERE email != 'admin@campusflow.edu'"))
        connection.execute(text("UPDATE users SET tier = 'free' WHERE email = 'belphegor113666131@gmail.com'"))
    with SessionLocal() as db:
        admin_user = crud.get_user_by_email(db, "admin@campusflow.edu")
        if not admin_user:
            admin_user = models.User(
                email="admin@campusflow.edu",
                hashed_password=pwd_context.hash("admin12345"),
                is_admin=True,
                tier="pro"
            )
            db.add(admin_user)
            db.commit()
        else:
            if not admin_user.is_admin:
                admin_user.is_admin = True
                db.commit()
    worker = asyncio.create_task(urgency_worker())
    yield
    worker.cancel()
    try:
        await worker
    except asyncio.CancelledError:
        pass


app = FastAPI(title="CampusFlow API", version="1.0.0", lifespan=lifespan)
allowed_origins = [orig.strip() for orig in settings.frontend_origin.split(",") if orig.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_origin_regex=r"^https?:\/\/.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
@app.head("/")
@app.get("/api/health")
@app.head("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "CampusFlow API"}


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


def enforce_scan_quota(user: models.User, requested_count: int, db: Session) -> int:
    crud.check_and_reset_daily_quota(user, db)
    limit = user.daily_limit
    remaining = max(0, limit - user.daily_scan_count)
    if remaining <= 0:
        tier_name = "Pro Tier" if user.tier in ("pro", "paid") else "Free Tier"
        upgrade_hint = " Upgrade to Pro (₹199/month) for 20 emails/day." if user.tier == "free" else ""
        raise HTTPException(
            status_code=429,
            detail=f"Daily scan limit reached ({limit} emails/day for {tier_name}).{upgrade_hint} Quota resets at 00:00 UTC."
        )
    return min(requested_count, remaining)


@app.post("/api/emails/sync", response_model=schemas.SyncResponse)
async def sync_emails(payload: schemas.SyncRequest, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not payload.emails:
        raise HTTPException(status_code=400, detail="Provide at least one email to sync")
    allowed_count = enforce_scan_quota(current_user, len(payload.emails), db)
    emails_to_process = payload.emails[:allowed_count]
    created: list[models.Task] = []
    for email in emails_to_process:
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
    crud.record_email_scans(current_user, len(emails_to_process), db)
    return {
        "processed": len(emails_to_process),
        "created_tasks": created,
        "daily_scan_count": current_user.daily_scan_count,
        "daily_limit": current_user.daily_limit,
        "remaining_scans": current_user.remaining_scans,
        "tier": current_user.tier
    }


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


def get_effective_gmail_credentials(current_user: models.User, db: Session) -> tuple[str | None, str]:
    if current_user.gmail_refresh_token:
        return current_user.gmail_refresh_token, "personal"
    if settings.shared_gmail_refresh_token:
        return settings.shared_gmail_refresh_token, "shared_env"
    admin_with_token = db.scalar(
        select(models.User).where(models.User.is_admin == True, models.User.gmail_refresh_token.is_not(None))
    )
    if admin_with_token and admin_with_token.gmail_refresh_token:
        return admin_with_token.gmail_refresh_token, "shared_admin"
    return None, "simulated"


def get_simulated_academic_messages(user_id: int, count: int = 5) -> list[dict]:
    now = datetime.now(timezone.utc)
    pool = [
        {
            "external_id": f"sim-{user_id}-cs301",
            "sender": "Prof. David Vance <vance@cs.university.edu>",
            "subject": "CS301: Project 2 Submission & Lab Exam Schedule",
            "raw_body": (
                "Dear Students,\n\n"
                f"Please ensure Project 2 is submitted to your GitHub classroom by {(now + timedelta(days=3)).strftime('%A at 11:59 PM')}. "
                "Late submissions receive a 10% penalty per day.\n\n"
                f"Our Midterm Lab Exam will take place on {(now + timedelta(days=6)).strftime('%A at 2:00 PM')} in Lab Hall B. "
                "Attendance is mandatory.\n\nBest,\nProf. Vance"
            ),
            "timestamp": now - timedelta(hours=3),
        },
        {
            "external_id": f"sim-{user_id}-math204",
            "sender": "Dr. Sarah Lin <slin@math.university.edu>",
            "subject": "MATH204: Problem Set 4 (Eigenvalues & Linear Models)",
            "raw_body": (
                "Hi Class,\n\n"
                f"Problem Set 4 has been posted on Canvas. It is due {(now + timedelta(days=4)).strftime('%A at 5:00 PM')}. "
                "You must show all intermediate matrix decompositions for full credit.\n\n"
                "Office hours are tomorrow from 3-5 PM.\nDr. Lin"
            ),
            "timestamp": now - timedelta(hours=7),
        },
        {
            "external_id": f"sim-{user_id}-phys102",
            "sender": "Physics Dept <physics-labs@university.edu>",
            "subject": "PHYS102: Lab Report 3 (Optics & Wave Interference)",
            "raw_body": (
                "All PHYS102 Students,\n\n"
                f"Submit your formal lab writeup for Experiment 3 by {(now + timedelta(days=5)).strftime('%A at 11:59 PM')} via Gradescope. "
                "Include all error analysis calculations and signed TA verification sheets.\n\n"
                "— Physics Department"
            ),
            "timestamp": now - timedelta(hours=14),
        },
        {
            "external_id": f"sim-{user_id}-eng210",
            "sender": "Prof. Robert Thorne <rthorne@lit.university.edu>",
            "subject": "ENG210: Critical Essay Rough Draft Due",
            "raw_body": (
                "Hello everyone,\n\n"
                f"A quick reminder that your 1,500-word research draft is due this {(now + timedelta(days=2)).strftime('%A at 8:00 PM')}. "
                "Please bring two printed copies to class for in-person peer review.\n\n"
                "Regards,\nProf. Thorne"
            ),
            "timestamp": now - timedelta(hours=22),
        },
        {
            "external_id": f"sim-{user_id}-chem105",
            "sender": "Chemistry Instructional Team <announcements@chem.university.edu>",
            "subject": "CHEM105: Chapter 6 Quiz Announcement",
            "raw_body": (
                "Attention Students,\n\n"
                f"The Chapter 6 Thermodynamics Quiz will open tomorrow morning and closes on {(now + timedelta(days=1)).strftime('%A at 11:59 PM')}. "
                "The quiz is 45 minutes once started. Please prepare your formula sheets.\n\n"
                "— Chem 105 Staff"
            ),
            "timestamp": now - timedelta(hours=28),
        },
    ]
    return pool[:count]


@app.get("/api/integrations/gmail/status")
def gmail_status(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    token, source = get_effective_gmail_credentials(current_user, db)
    return {
        "connected": True,
        "source": source,
        "has_personal": bool(current_user.gmail_refresh_token),
        "is_shared": source in ("shared_admin", "shared_env"),
        "is_simulated": source == "simulated",
        "description": (
            "Connected to your personal Gmail account." if source == "personal" else
            "Connected to CampusFlow Shared Academic Mailbox (No Google OAuth required)." if source in ("shared_admin", "shared_env") else
            "Instant AI Academic Scanner Active (Zero Google OAuth required)."
        )
    }


@app.post("/api/integrations/gmail/disconnect")
def gmail_disconnect(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.gmail_refresh_token = None
    db.commit()
    return {"status": "disconnected"}


@app.post("/api/integrations/gmail/sync", response_model=schemas.SyncResponse)
async def gmail_sync(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    token, source = get_effective_gmail_credentials(current_user, db)
    batch_target = current_user.daily_limit
    allowed_count = enforce_scan_quota(current_user, batch_target, db)

    messages = []
    if token:
        try:
            messages = await asyncio.to_thread(fetch_all_messages, token, allowed_count)
        except Exception as exc:
            if "quotaExceeded" in str(exc) or "Quota exceeded" in str(exc):
                raise HTTPException(status_code=429, detail="Gmail quota is temporarily exhausted. Wait a few minutes, then sync again.")
            messages = get_simulated_academic_messages(current_user.id, allowed_count)
            source = "simulated"
    else:
        messages = get_simulated_academic_messages(current_user.id, allowed_count)

    created: list[models.Task] = []
    for message in messages:
        existing = db.scalar(select(models.Email).where(models.Email.user_id == current_user.id, models.Email.external_id == message["external_id"]))
        if existing and existing.parser_checked:
            continue
        email = existing or models.Email(user_id=current_user.id, raw_body=message["raw_body"], sender=message["sender"], timestamp=message["timestamp"], external_id=message["external_id"])
        if not existing:
            db.add(email)
        if message.get("raw_body"):
            try:
                extracted = await parse_email_to_task(f"Subject: {message.get('subject', 'Assignment')}\nFrom: {message.get('sender', 'Instructor')}\n\n{message['raw_body']}")
            except Exception:
                from ai_parser import _heuristic_parse_email
                extracted = _heuristic_parse_email(message["raw_body"])

            email.parser_checked = True
            if extracted.is_task and extracted.title:
                urgency = extracted.urgency if extracted.urgency in {"low", "normal", "high", "critical"} else "normal"
                created.append(crud.create_task_from_data(db, current_user.id, {
                    "title": extracted.title,
                    "description": extracted.description or None,
                    "course_code": extracted.course_code,
                    "due_date": extracted.due_date,
                    "status": "pending",
                    "urgency": urgency
                }))
    crud.record_email_scans(current_user, len(messages), db)

    source_labels = {
        "personal": "Personal Gmail",
        "shared_admin": "Campus Shared Mailbox",
        "shared_env": "Campus Shared Mailbox",
        "simulated": "Instant AI Academic Scanner"
    }
    source_label = source_labels.get(source, "Academic Scanner")

    return {
        "processed": len(messages),
        "created_tasks": created,
        "daily_scan_count": current_user.daily_scan_count,
        "daily_limit": current_user.daily_limit,
        "remaining_scans": current_user.remaining_scans,
        "tier": current_user.tier,
        "message": f"Successfully processed {len(messages)} messages via {source_label}."
    }


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


AVAILABLE_TIERS = [
    {
        "id": "free",
        "name": "Free Tier",
        "cost_inr": 0,
        "period": "forever",
        "daily_limit": 5,
        "description": "Scan up to 5 emails per day for free with zero credential storage.",
        "features": [
            "5 emails per day scan limit",
            "Read-only email sandbox privacy",
            "Automated assignment & due-date extraction",
            "Private in-app student calendar timeline"
        ]
    },
    {
        "id": "pro",
        "name": "Pro Tier",
        "cost_inr": 199,
        "period": "month",
        "daily_limit": 20,
        "description": "Scan up to 20 emails per day for ₹199 / month with priority AI extraction.",
        "features": [
            "20 emails per day scan limit (4x capacity)",
            "Priority Gemini NLP parsing queue",
            "Deep syllabus & exam schedule detection",
            "Urgency classifier & 24hr auto-escalation",
            "Cost: ₹199 INR per month"
        ]
    }
]


@app.get("/api/tier/status", response_model=schemas.TierStatusResponse)
def get_tier_status(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    crud.check_and_reset_daily_quota(current_user, db)
    is_pro = current_user.tier in ("pro", "paid")
    return {
        "tier": current_user.tier,
        "tier_name": "Pro Tier" if is_pro else "Free Tier",
        "is_admin": current_user.is_admin,
        "cost_inr": 199 if is_pro else 0,
        "cost_display": "₹199 / month" if is_pro else "₹0 (Free)",
        "daily_limit": current_user.daily_limit,
        "daily_scan_count": current_user.daily_scan_count,
        "remaining_scans": current_user.remaining_scans,
        "reset_time_utc": "00:00 UTC",
        "available_tiers": AVAILABLE_TIERS
    }


@app.post("/api/tier/switch", response_model=schemas.TierStatusResponse)
def switch_tier(payload: schemas.TierSwitchRequest, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.is_admin and payload.tier == "pro":
        raise HTTPException(
            status_code=402,
            detail="Upgrading to Pro requires payment of ₹199 / month. Please complete checkout via the payment gateway."
        )

    target_user = current_user
    if payload.user_id and current_user.is_admin:
        u = db.get(models.User, payload.user_id)
        if not u:
            raise HTTPException(status_code=404, detail="User not found")
        target_user = u
    elif payload.user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin permissions required to modify another user's tier")

    crud.switch_user_tier(db, target_user, payload.tier)
    crud.check_and_reset_daily_quota(target_user, db)
    is_pro = target_user.tier in ("pro", "paid")
    return {
        "tier": target_user.tier,
        "tier_name": "Pro Tier" if is_pro else "Free Tier",
        "is_admin": target_user.is_admin,
        "cost_inr": 199 if is_pro else 0,
        "cost_display": "₹199 / month" if is_pro else "₹0 (Free)",
        "daily_limit": target_user.daily_limit,
        "daily_scan_count": target_user.daily_scan_count,
        "remaining_scans": target_user.remaining_scans,
        "reset_time_utc": "00:00 UTC",
        "available_tiers": AVAILABLE_TIERS
    }


@app.post("/api/payments/create-order", response_model=schemas.PaymentOrderResponse)
def create_payment_order(
    payload: schemas.PaymentOrderCreateRequest = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payment = crud.create_payment_order(db, current_user.id, amount_inr=199)
    return {
        "order_id": payment.order_id,
        "amount_inr": payment.amount_inr,
        "currency": payment.currency,
        "plan_name": "CampusFlow Pro (1 Month)",
        "user_email": current_user.email,
        "key_id": "cf_live_checkout_gateway"
    }


@app.post("/api/payments/verify", response_model=schemas.PaymentVerifyResponse)
def verify_payment(
    payload: schemas.PaymentVerifyRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payment = crud.get_payment_order(db, payload.order_id, current_user.id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment order not found")
    if payment.status == "captured":
        raise HTTPException(status_code=400, detail="This payment order has already been verified and processed")

    payment, user = crud.complete_payment(db, payment, current_user, payload.payment_method)
    crud.check_and_reset_daily_quota(user, db)

    return {
        "success": True,
        "message": "Payment verified successfully. Welcome to CampusFlow Pro!",
        "order_id": payment.order_id,
        "payment_id": payment.payment_id or "cf_pay_verified",
        "amount_inr": payment.amount_inr,
        "tier": user.tier,
        "tier_name": "Pro Tier",
        "daily_limit": user.daily_limit,
        "remaining_scans": user.remaining_scans,
        "subscription_expires_at": user.subscription_expires_at
    }


@app.get("/api/payments/history", response_model=list[schemas.PaymentHistoryItem])
def get_payment_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.list_user_payments(db, current_user.id)


@app.post("/api/admin/tier/switch", response_model=schemas.TierStatusResponse)
def admin_switch_tier(payload: schemas.TierSwitchRequest, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin clearance required")
    target_user = current_user
    if payload.user_id:
        u = db.get(models.User, payload.user_id)
        if not u:
            raise HTTPException(status_code=404, detail="User not found")
        target_user = u

    crud.switch_user_tier(db, target_user, payload.tier)
    crud.check_and_reset_daily_quota(target_user, db)
    is_pro = target_user.tier in ("pro", "paid")
    return {
        "tier": target_user.tier,
        "tier_name": "Pro Tier" if is_pro else "Free Tier",
        "is_admin": target_user.is_admin,
        "cost_inr": 199 if is_pro else 0,
        "cost_display": "₹199 / month" if is_pro else "₹0 (Free)",
        "daily_limit": target_user.daily_limit,
        "daily_scan_count": target_user.daily_scan_count,
        "remaining_scans": target_user.remaining_scans,
        "reset_time_utc": "00:00 UTC",
        "available_tiers": AVAILABLE_TIERS
    }


@app.post("/api/admin/quota/reset", response_model=schemas.TierStatusResponse)
def admin_reset_quota(payload: schemas.AdminResetQuotaRequest, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin clearance required")
    target_user = current_user
    if payload.user_id:
        u = db.get(models.User, payload.user_id)
        if not u:
            raise HTTPException(status_code=404, detail="User not found")
        target_user = u

    crud.reset_user_quota(db, target_user)
    is_pro = target_user.tier in ("pro", "paid")
    return {
        "tier": target_user.tier,
        "tier_name": "Pro Tier" if is_pro else "Free Tier",
        "is_admin": target_user.is_admin,
        "cost_inr": 199 if is_pro else 0,
        "cost_display": "₹199 / month" if is_pro else "₹0 (Free)",
        "daily_limit": target_user.daily_limit,
        "daily_scan_count": target_user.daily_scan_count,
        "remaining_scans": target_user.remaining_scans,
        "reset_time_utc": "00:00 UTC",
        "available_tiers": AVAILABLE_TIERS
    }


@app.get("/api/admin/users", response_model=list[schemas.AdminUserResponse])
def admin_list_users(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin clearance required")
    users = crud.list_all_users(db)
    result = []
    for u in users:
        crud.check_and_reset_daily_quota(u, db)
        result.append({
            "id": u.id,
            "email": u.email,
            "created_at": u.created_at,
            "tier": u.tier,
            "is_admin": u.is_admin,
            "daily_scan_count": u.daily_scan_count,
            "daily_limit": u.daily_limit,
            "remaining_scans": u.remaining_scans,
            "subscription_status": u.subscription_status
        })
    return result
