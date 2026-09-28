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
    tier: str = "free"
    is_admin: bool = False
    daily_scan_count: int = 0
    daily_limit: int = 5
    remaining_scans: int = 5
    subscription_status: str = "active"
    subscription_expires_at: datetime | None = None


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
    daily_scan_count: int = 0
    daily_limit: int = 5
    remaining_scans: int = 5
    tier: str = "free"


class TierPlan(BaseModel):
    id: str
    name: str
    cost_inr: int
    period: str
    daily_limit: int
    description: str
    features: list[str]


class TierStatusResponse(BaseModel):
    tier: str
    tier_name: str
    is_admin: bool
    cost_inr: int
    cost_display: str
    daily_limit: int
    daily_scan_count: int
    remaining_scans: int
    reset_time_utc: str
    available_tiers: list[TierPlan]


class TierSwitchRequest(BaseModel):
    tier: Literal["free", "pro"]
    user_id: int | None = None


class AdminResetQuotaRequest(BaseModel):
    user_id: int | None = None


class AdminUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: EmailStr
    created_at: datetime
    tier: str
    is_admin: bool
    daily_scan_count: int
    daily_limit: int
    remaining_scans: int
    subscription_status: str


class PaymentOrderCreateRequest(BaseModel):
    tier: Literal["pro"] = "pro"


class PaymentOrderResponse(BaseModel):
    order_id: str
    amount_inr: int
    currency: str
    plan_name: str
    user_email: str
    key_id: str = "cf_live_checkout_gateway"


class PaymentVerifyRequest(BaseModel):
    order_id: str
    payment_method: Literal["upi", "card", "netbanking"]
    upi_id: str | None = None
    card_last4: str | None = None
    bank_name: str | None = None


class PaymentVerifyResponse(BaseModel):
    success: bool
    message: str
    order_id: str
    payment_id: str
    amount_inr: int
    tier: str
    tier_name: str
    daily_limit: int
    remaining_scans: int
    subscription_expires_at: datetime | None


class PaymentHistoryItem(BaseModel):
    id: int
    order_id: str
    payment_id: str | None
    amount_inr: int
    currency: str
    status: str
    payment_method: str | None
    created_at: datetime
    completed_at: datetime | None

