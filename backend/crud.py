from datetime import datetime, timedelta, timezone
import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

import models
import schemas


def get_user_by_email(db: Session, email: str) -> models.User | None:
    return db.scalar(select(models.User).where(models.User.email == email.lower()))


def create_user(db: Session, email: str, hashed_password: str, is_admin: bool = False, tier: str = "free") -> models.User:
    user = models.User(email=email.lower(), hashed_password=hashed_password, is_admin=is_admin, tier=tier)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_email(db: Session, user_id: int, payload: schemas.EmailInput) -> models.Email:
    email = models.Email(user_id=user_id, raw_body=payload.raw_body, sender=payload.sender, timestamp=payload.timestamp or datetime.now(timezone.utc))
    db.add(email)
    db.flush()
    return email


def list_tasks(db: Session, user_id: int, course_code: str | None = None, status: str | None = None) -> list[models.Task]:
    query = select(models.Task).where(models.Task.user_id == user_id).order_by(models.Task.due_date.is_(None), models.Task.due_date)
    if course_code:
        query = query.where(models.Task.course_code == course_code)
    if status:
        query = query.where(models.Task.status == status)
    return list(db.scalars(query).all())


def create_task(db: Session, user_id: int, payload: schemas.TaskCreate) -> models.Task:
    task = models.Task(user_id=user_id, **payload.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def create_task_from_data(db: Session, user_id: int, data: dict) -> models.Task:
    task = models.Task(user_id=user_id, **data)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def get_task(db: Session, user_id: int, task_id: int) -> models.Task | None:
    return db.scalar(select(models.Task).where(models.Task.id == task_id, models.Task.user_id == user_id))


def update_task(db: Session, task: models.Task, payload: schemas.TaskUpdate) -> models.Task:
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task: models.Task) -> None:
    db.delete(task)
    db.commit()


def list_events(db: Session, user_id: int) -> list[models.Event]:
    return list(db.scalars(select(models.Event).where(models.Event.user_id == user_id).order_by(models.Event.event_date)).all())


def flag_urgent_tasks(db: Session) -> int:
    now = datetime.now(timezone.utc)
    cutoff = now + timedelta(hours=24)
    tasks = db.scalars(select(models.Task).where(models.Task.status == "pending", models.Task.due_date.is_not(None), models.Task.due_date <= cutoff)).all()
    for task in tasks:
        task.urgency = "critical" if task.due_date and task.due_date <= now else "high"
    if tasks:
        db.commit()
    return len(tasks)


def check_and_reset_daily_quota(user: models.User, db: Session) -> None:
    today = datetime.now(timezone.utc).date()
    if user.last_scan_date != today:
        user.daily_scan_count = 0
        user.last_scan_date = today
        db.commit()
        db.refresh(user)


def record_email_scans(user: models.User, count: int, db: Session) -> None:
    today = datetime.now(timezone.utc).date()
    if user.last_scan_date != today:
        user.daily_scan_count = 0
        user.last_scan_date = today
    user.daily_scan_count += count
    db.commit()
    db.refresh(user)


def switch_user_tier(db: Session, user: models.User, new_tier: str) -> models.User:
    user.tier = new_tier
    if new_tier in ("pro", "paid"):
        user.subscription_status = "active"
        user.subscription_expires_at = datetime.now(timezone.utc) + timedelta(days=30)
    else:
        user.subscription_status = "active"
        user.subscription_expires_at = None
    db.commit()
    db.refresh(user)
    return user


def reset_user_quota(db: Session, user: models.User) -> models.User:
    user.daily_scan_count = 0
    user.last_scan_date = datetime.now(timezone.utc).date()
    db.commit()
    db.refresh(user)
    return user


def list_all_users(db: Session) -> list[models.User]:
    return list(db.scalars(select(models.User).order_by(models.User.id)).all())


def create_payment_order(db: Session, user_id: int, amount_inr: int = 199) -> models.Payment:
    order_id = f"cf_ord_{uuid.uuid4().hex[:12]}"
    payment = models.Payment(
        user_id=user_id,
        order_id=order_id,
        amount_inr=amount_inr,
        currency="INR",
        status="created"
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


def get_payment_order(db: Session, order_id: str, user_id: int) -> models.Payment | None:
    return db.scalar(
        select(models.Payment).where(
            models.Payment.order_id == order_id,
            models.Payment.user_id == user_id
        )
    )


def complete_payment(db: Session, payment: models.Payment, user: models.User, payment_method: str) -> tuple[models.Payment, models.User]:
    payment.payment_id = f"cf_pay_{uuid.uuid4().hex[:14]}"
    payment.status = "captured"
    payment.payment_method = payment_method
    payment.completed_at = datetime.now(timezone.utc)
    
    # Upgrade user to Pro Tier for 30 days
    user.tier = "pro"
    user.subscription_status = "active"
    user.subscription_expires_at = datetime.now(timezone.utc) + timedelta(days=30)
    
    db.commit()
    db.refresh(payment)
    db.refresh(user)
    return payment, user


def list_user_payments(db: Session, user_id: int) -> list[models.Payment]:
    return list(
        db.scalars(
            select(models.Payment)
            .where(models.Payment.user_id == user_id)
            .order_by(models.Payment.created_at.desc())
        ).all()
    )

