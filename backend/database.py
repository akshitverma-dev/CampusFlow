import logging
from collections.abc import Generator

from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

logger = logging.getLogger("campusflow.database")


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://campusflow:campusflow@localhost:5432/campusflow"
    secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 1440
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-2.5-flash"
    frontend_origin: str = "http://localhost:5173"
    google_client_id: str | None = None
    google_client_secret: str | None = None
    google_redirect_uri: str = "http://localhost:8000/api/integrations/gmail/callback"
    shared_gmail_refresh_token: str | None = None

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

# Normalize database URL for cloud providers (Neon, Supabase, Render, Railway, etc.)
raw_db_url = settings.database_url
if raw_db_url.startswith("postgres://"):
    raw_db_url = raw_db_url.replace("postgres://", "postgresql+psycopg://", 1)
elif raw_db_url.startswith("postgresql://") and not raw_db_url.startswith("postgresql+psycopg://"):
    raw_db_url = raw_db_url.replace("postgresql://", "postgresql+psycopg://", 1)

# Attempt connection to configured database URL with graceful SQLite fallback if local postgres is unreachable
engine = None
try:
    if "postgresql" in raw_db_url and ("localhost" in raw_db_url or "127.0.0.1" in raw_db_url):
        # Quick timeout test for local postgres
        test_engine = create_engine(raw_db_url, connect_args={"connect_timeout": 2})
        with test_engine.connect() as conn:
            pass
        engine = test_engine
    else:
        engine = create_engine(raw_db_url, pool_pre_ping=True)
except Exception as e:
    logger.warning("Local PostgreSQL connection failed (%s). Falling back to SQLite.", e)
    sqlite_url = "sqlite:///./campusflow.db"
    engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

if engine is None:
    engine = create_engine("sqlite:///./campusflow.db", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
