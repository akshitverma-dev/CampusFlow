import base64
import json
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

from cryptography.fernet import Fernet
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials

from database import settings

GMAIL_SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]


def _fernet() -> Fernet:
    key = base64.urlsafe_b64encode(settings.secret_key.encode().ljust(32, b"0")[:32])
    return Fernet(key)


def _client_config() -> dict:
    if not settings.google_client_id or not settings.google_client_secret:
        raise RuntimeError("Google OAuth credentials are not configured")
    return {"web": {"client_id": settings.google_client_id, "client_secret": settings.google_client_secret, "auth_uri": "https://accounts.google.com/o/oauth2/auth", "token_uri": "https://oauth2.googleapis.com/token", "redirect_uris": [settings.google_redirect_uri]}}


def create_authorization_url(state: str) -> str:
    flow = Flow.from_client_config(_client_config(), scopes=GMAIL_SCOPES, state=state, redirect_uri=settings.google_redirect_uri)
    url, _ = flow.authorization_url(access_type="offline", prompt="consent", include_granted_scopes="true")
    return url


def exchange_code(code: str, state: str) -> str:
    flow = Flow.from_client_config(_client_config(), scopes=GMAIL_SCOPES, state=state, redirect_uri=settings.google_redirect_uri)
    flow.fetch_token(code=code)
    if not flow.credentials.refresh_token:
        raise RuntimeError("Google did not return a refresh token; revoke the app access and reconnect")
    return _fernet().encrypt(flow.credentials.to_json().encode()).decode()


def decrypt_credentials(encrypted: str) -> Credentials:
    data = json.loads(_fernet().decrypt(encrypted.encode()).decode())
    return Credentials.from_authorized_user_info(data, GMAIL_SCOPES)


def _decode_body(payload: dict) -> str:
    if payload.get("body", {}).get("data"):
        return base64.urlsafe_b64decode(payload["body"]["data"]).decode("utf-8", errors="replace")
    for part in payload.get("parts", []):
        body = _decode_body(part)
        if body:
            return body
    return ""


def _header(payload: dict, name: str) -> str:
    return next((item["value"] for item in payload.get("headers", []) if item["name"].lower() == name.lower()), "")


def fetch_all_messages(encrypted_credentials: str, max_messages: int = 20) -> list[dict]:
    credentials = decrypt_credentials(encrypted_credentials)
    service = build("gmail", "v1", credentials=credentials, cache_discovery=False)
    messages: list[dict] = []
    page_token = None
    while True:
        result = service.users().messages().list(userId="me", pageToken=page_token, maxResults=100, q="in:anywhere").execute()
        for item in result.get("messages", []):
            message = service.users().messages().get(userId="me", id=item["id"], format="full").execute()
            payload = message.get("payload", {})
            raw_date = _header(payload, "Date")
            try:
                timestamp = parsedate_to_datetime(raw_date).astimezone(timezone.utc) if raw_date else datetime.now(timezone.utc)
            except (TypeError, ValueError, OverflowError):
                timestamp = datetime.now(timezone.utc)
            messages.append({"external_id": message["id"], "sender": _header(payload, "From") or "unknown", "subject": _header(payload, "Subject"), "raw_body": _decode_body(payload), "timestamp": timestamp})
            if len(messages) >= max_messages:
                return messages
        page_token = result.get("nextPageToken")
        if not page_token:
            return messages
