from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

import models
import schemas


def get_user_by_email(db: Session, email: str) -> models.User | None:
    return db.scalar(select(models.User).where(models.User.email == email.lower()))


def create_user(db: Session, email: str, hashed_password: str) -> models.User:
    user = models.User(email=email.lower(), hashed_password=hashed_password)
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
