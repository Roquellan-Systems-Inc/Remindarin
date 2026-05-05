from fastapi import APIRouter
from pydantic import BaseModel
from app.services.nvidia_ai import call_nvidia_ai
import json

router = APIRouter(prefix="/api/v1/reminders", tags=["Reminders"])

class ParseRequest(BaseModel):
    text: str

@router.post("/parse")
async def parse_reminder(request: ParseRequest):
    system_prompt = """Extract structured reminder data from the user's message.
    Return ONLY valid JSON with these keys: text, time, location, priority, duration.
    If any value is missing, use null. Priority can be low, medium, or high."""

    result = await call_nvidia_ai(request.text, system_prompt)
    
    try:
        data = json.loads(result)
        return {"success": True, "reminder": data}
    except:
        return {"success": False, "error": "Failed to parse reminder", "raw": result}