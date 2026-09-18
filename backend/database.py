from collections.abc import Generator

from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker


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

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
