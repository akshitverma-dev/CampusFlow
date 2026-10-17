import base64
import html
import json
import re
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


def _clean_credentials() -> tuple[str, str, str]:
    client_id = (settings.google_client_id or "").strip()
    client_secret = (settings.google_client_secret or "").strip()
    redirect_uri = (settings.google_redirect_uri or "https://campusflow-9bsk.onrender.com/api/integrations/gmail/callback").strip()
    return client_id, client_secret, redirect_uri


def _client_config() -> dict:
    client_id, client_secret, redirect_uri = _clean_credentials()
    if not client_id or not client_secret:
        raise RuntimeError("Google OAuth credentials are not configured")
    return {
        "web": {
            "client_id": client_id,
            "client_secret": client_secret,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [redirect_uri],
        }
    }


def create_authorization_url(state: str) -> str:
    _, _, redirect_uri = _clean_credentials()
    flow = Flow.from_client_config(_client_config(), scopes=GMAIL_SCOPES, state=state, redirect_uri=redirect_uri)
    url, _ = flow.authorization_url(access_type="offline", prompt="consent", include_granted_scopes="true")
    return url


def exchange_code(code: str, state: str) -> str:
    _, _, redirect_uri = _clean_credentials()
    flow = Flow.from_client_config(_client_config(), scopes=GMAIL_SCOPES, state=state, redirect_uri=redirect_uri)
    flow.fetch_token(code=code)
    if not flow.credentials.refresh_token:
        raise RuntimeError("Google did not return a refresh token; revoke the app access and reconnect")
    return _fernet().encrypt(flow.credentials.to_json().encode()).decode()


def decrypt_credentials(encrypted: str) -> Credentials:
    data = json.loads(_fernet().decrypt(encrypted.encode()).decode())
    return Credentials.from_authorized_user_info(data, GMAIL_SCOPES)


def _clean_html_text(raw_html: str) -> str:
    if not raw_html:
        return ""
    # Strip script and style blocks
    cleaned = re.sub(r'<(style|script)[^>]*>.*?</\1>', ' ', raw_html, flags=re.DOTALL | re.IGNORECASE)
    # Convert paragraph and break tags to newlines
    cleaned = re.sub(r'<(br|p|div|tr)[^>]*>', '\n', cleaned, flags=re.IGNORECASE)
    # Strip remaining HTML tags
    cleaned = re.sub(r'<[^>]+>', ' ', cleaned)
    # Decode HTML entities
    cleaned = html.unescape(cleaned)
    # Clean up whitespace
    cleaned = re.sub(r'[ \t]+', ' ', cleaned)
    cleaned = re.sub(r'\n\s*\n', '\n\n', cleaned).strip()
    return cleaned


def _extract_body_text(payload: dict) -> str:
    mime = payload.get("mimeType", "")
    data = payload.get("body", {}).get("data")
    if data:
        decoded = base64.urlsafe_b64decode(data).decode("utf-8", errors="replace")
        return decoded.strip() if mime == "text/plain" else _clean_html_text(decoded)

    parts = payload.get("parts", [])
    # 1. Prefer text/plain first
    for part in parts:
        if part.get("mimeType") == "text/plain" and part.get("body", {}).get("data"):
            decoded = base64.urlsafe_b64decode(part["body"]["data"]).decode("utf-8", errors="replace")
            if decoded.strip():
                return decoded.strip()

    # 2. Recurse down sub-parts
    for part in parts:
        text = _extract_body_text(part)
        if text.strip():
            return text.strip()

    return ""


def _header(payload: dict, name: str) -> str:
    return next((item["value"] for item in payload.get("headers", []) if item["name"].lower() == name.lower()), "")


def fetch_all_messages(encrypted_credentials: str, max_messages: int = 20) -> list[dict]:
    credentials = decrypt_credentials(encrypted_credentials)
    service = build("gmail", "v1", credentials=credentials, cache_discovery=False)
    messages: list[dict] = []
    seen_ids: set[str] = set()

    # Prioritize academic & course emails first, filtering out system/promotional noise
    queries = [
        (
            "-from:google.com -from:accounts.google.com -category:promotions -category:social -category:spam "
            "(assignment OR homework OR project OR exam OR quiz OR syllabus OR due OR deadline OR submission OR lab OR course OR lecture OR midterm OR practical OR viva OR class)"
        ),
        "-from:google.com -from:accounts.google.com -category:promotions -category:social -category:spam"
    ]

    for q in queries:
        page_token = None
        while len(messages) < max_messages:
            result = service.users().messages().list(
                userId="me", 
                pageToken=page_token, 
                maxResults=min(50, max_messages * 3), 
                q=q
            ).execute()
            
            raw_items = result.get("messages", [])
            if not raw_items:
                break
                
            for item in raw_items:
                msg_id = item["id"]
                if msg_id in seen_ids:
                    continue
                seen_ids.add(msg_id)
                
                message = service.users().messages().get(userId="me", id=msg_id, format="full").execute()
                payload = message.get("payload", {})
                from_header = _header(payload, "From")
                
                # Double check to skip Google security alerts or system noise
                lower_from = from_header.lower()
                if "no-reply@accounts.google.com" in lower_from or "accounts.google.com" in lower_from:
                    continue

                raw_date = _header(payload, "Date")
                try:
                    timestamp = parsedate_to_datetime(raw_date).astimezone(timezone.utc) if raw_date else datetime.now(timezone.utc)
                except (TypeError, ValueError, OverflowError):
                    timestamp = datetime.now(timezone.utc)

                body_text = _extract_body_text(payload)
                messages.append({
                    "external_id": msg_id,
                    "sender": from_header or "unknown",
                    "subject": _header(payload, "Subject"),
                    "raw_body": body_text,
                    "timestamp": timestamp
                })
                
                if len(messages) >= max_messages:
                    return messages

            page_token = result.get("nextPageToken")
            if not page_token:
                break

        if len(messages) >= max_messages:
            break

    return messages
