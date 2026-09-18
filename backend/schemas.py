from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: EmailStr
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TaskBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    course_code: str | None = Field(default=None, max_length=32)
    due_date: datetime | None = None
    status: Literal["pending", "completed"] = "pending"
    urgency: Literal["low", "normal", "high", "critical"] = "normal"


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    course_code: str | None = Field(default=None, max_length=32)
    due_date: datetime | None = None
    status: Literal["pending", "completed"] | None = None
    urgency: Literal["low", "normal", "high", "critical"] | None = None


class TaskResponse(TaskBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int


class EventCreate(BaseModel):
    event_name: str = Field(min_length=1, max_length=255)
    event_date: datetime
    location: str | None = Field(default=None, max_length=255)


class EventResponse(EventCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int


class EmailInput(BaseModel):
    raw_body: str = Field(min_length=1)
    sender: str = Field(min_length=1, max_length=320)
    timestamp: datetime | None = None


class SyncRequest(BaseModel):
    emails: list[EmailInput] = Field(default_factory=list, max_length=25)


class SyncResponse(BaseModel):
    processed: int
    created_tasks: list[TaskResponse]
