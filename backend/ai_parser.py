import asyncio
from datetime import datetime

from google import genai
from google.genai import types
from pydantic import BaseModel, Field

from database import settings


class TaskExtraction(BaseModel):
    is_task: bool = Field(description="Whether the email contains an actionable academic task")
    title: str
    description: str
    course_code: str | None = None
    due_date: datetime | None = None
    urgency: str


def _heuristic_parse_email(raw_email: str) -> TaskExtraction:
    import re
    from datetime import timedelta, timezone
    
    # Try finding course code like CS301, MATH204, PHYS102
    course_match = re.search(r'\b([A-Z]{2,5}\s?\d{3,4})\b', raw_email)
    course_code = course_match.group(1).replace(' ', '') if course_match else "ACAD"
    
    # Check for actionable academic keywords
    is_task = any(kw in raw_email.lower() for kw in ["due", "submit", "deadline", "exam", "quiz", "lab", "assignment", "homework", "project", "presentation"])
    
    # Urgency detection
    urgency = "normal"
    lower_email = raw_email.lower()
    if any(k in lower_email for k in ["critical", "final exam", "tomorrow", "urgent", "tonight", "penalty"]):
        urgency = "critical"
    elif any(k in lower_email for k in ["important", "quiz", "exam", "due soon", "lab report"]):
        urgency = "high"
        
    # Title extraction from subject or first meaningful line
    title = "Academic Task"
    subj_match = re.search(r'Subject:\s*([^\n]+)', raw_email, re.IGNORECASE)
    if subj_match:
        title = subj_match.group(1).strip()
    else:
        first_line = [l.strip() for l in raw_email.splitlines() if l.strip()]
        if first_line:
            title = first_line[0][:70]
            
    # Estimate a due date in 3 days
    estimated_due = datetime.now(timezone.utc) + timedelta(days=3, hours=4)
    
    return TaskExtraction(
        is_task=is_task,
        title=title,
        description=raw_email[:300].strip(),
        course_code=course_code,
        due_date=estimated_due,
        urgency=urgency,
    )


async def parse_email_to_task(raw_email: str) -> TaskExtraction:
    if not settings.gemini_api_key:
        return _heuristic_parse_email(raw_email)

    client = genai.Client(api_key=settings.gemini_api_key)
    prompt = (
        "Extract an academic task from this email. Use an ISO-8601 date with timezone when a deadline is present. "
        "Set is_task false for newsletters or messages without a concrete student action. Return only the requested JSON.\n\n"
        f"EMAIL:\n{raw_email}"
    )
    models_to_try = list(dict.fromkeys([settings.gemini_model, "gemini-2.5-flash", "gemini-3.1-flash-lite", "gemini-flash-lite-latest"]))
    last_error: Exception | None = None
    for model in models_to_try:
        for attempt in range(2):
            try:
                response = await client.aio.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema=TaskExtraction,
                        temperature=0.1,
                    ),
                )
                return TaskExtraction.model_validate_json(response.text)
            except Exception as exc:
                last_error = exc
                if "503" in str(exc) or "UNAVAILABLE" in str(exc):
                    await asyncio.sleep(1 + attempt)
                else:
                    break
    # If all Gemini models fail or quota exhausted, fall back smoothly
    return _heuristic_parse_email(raw_email)
