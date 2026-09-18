from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    gmail_refresh_token: Mapped[str | None] = mapped_column(Text, nullable=True)
    emails: Mapped[list["Email"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    tasks: Mapped[list["Task"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    events: Mapped[list["Event"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Email(Base):
    __tablename__ = "emails"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    raw_body: Mapped[str] = mapped_column(Text)
    sender: Mapped[str] = mapped_column(String(320))
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    external_id: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    parser_checked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    user: Mapped[User] = relationship(back_populates="emails")


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    course_code: Mapped[str | None] = mapped_column(String(32), index=True, nullable=True)
    due_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)
    urgency: Mapped[str] = mapped_column(String(20), default="normal", index=True)
    user: Mapped[User] = relationship(back_populates="tasks")


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    event_name: Mapped[str] = mapped_column(String(255))
    event_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    user: Mapped[User] = relationship(back_populates="events")
