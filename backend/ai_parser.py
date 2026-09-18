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


async def parse_email_to_task(raw_email: str) -> TaskExtraction:
    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured")

    client = genai.Client(api_key=settings.gemini_api_key)
    prompt = (
        "Extract an academic task from this email. Use an ISO-8601 date with timezone when a deadline is present. "
        "Set is_task false for newsletters or messages without a concrete student action. Return only the requested JSON.\n\n"
        f"EMAIL:\n{raw_email}"
    )
    models_to_try = list(dict.fromkeys([settings.gemini_model, "gemini-3.1-flash-lite", "gemini-flash-lite-latest"]))
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
    raise RuntimeError(f"Gemini models unavailable: {last_error}")
