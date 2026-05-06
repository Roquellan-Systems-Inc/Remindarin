from starlette.requests import Request
from starlette.responses import JSONResponse
from ..services.nvidia_ai import call_nvidia_ai
from ..database import SessionLocal, Reminder
import datetime

async def get_smart_suggestions(request: Request):
    """AI-powered Smart Suggestions — generates 3 fresh suggestions daily"""
    db = SessionLocal()
    try:
        hour = datetime.datetime.now().hour

        # Load current reminders for context
        reminders = db.query(Reminder).filter(Reminder.completed == False).limit(6).all()
        reminder_context = "\n".join([
            f"• {r.date or 'today'} {r.time or ''} | {r.context} | {r.text}"
            for r in reminders
        ]) or "No active reminders."

        system_prompt = f"""You are Remindarin AI — a productivity coach.

Current time: {hour}:00
Current active reminders:
{reminder_context}

Generate exactly 3 fresh, actionable, and inspiring productivity suggestions for the user right now.
Make them short, specific, and relevant to the time of day.

Return ONLY a valid JSON array of 3 strings. No other text.

Example:
[
  "Review your top 3 priorities for today",
  "Take a 5-minute stretch and hydrate",
  "Block 45 minutes for deep focused work"
]
"""

        reply = await call_nvidia_ai("Generate 3 smart suggestions now.", system_prompt)

        # Extract JSON array
        import re
        json_match = re.search(r'\[\s*".*?"(?:\s*,\s*".*?")*\s*\]', reply, re.DOTALL)
        if json_match:
            try:
                suggestions = eval(json_match.group(0))
                if isinstance(suggestions, list) and len(suggestions) >= 3:
                    return JSONResponse({"suggestions": suggestions[:3]})
            except:
                pass

        # Fallback suggestions
        fallback = [
            "Review your top 3 priorities for today",
            "Block time for deep focused work",
            "Prepare tomorrow's plan"
        ]
        return JSONResponse({"suggestions": fallback})

    finally:
        db.close()