from starlette.requests import Request
from starlette.responses import JSONResponse

from ..services.nvidia_ai import call_nvidia_ai
from ..database import SessionLocal, ChatMessage, Reminder

import re
import json


async def chat_with_ai(request: Request):
    db = SessionLocal()

    try:
        # 1. Parse request body
        try:
            body = await request.json()
        except Exception:
            return JSONResponse(
                {"error": "Invalid JSON body"},
                status_code=400
            )

        user_message = body.get("message", "").strip()
        if not user_message:
            return JSONResponse(
                {"error": "Message is required"},
                status_code=400
            )

        # 2. Save user message
        user_msg = ChatMessage(role="user", content=user_message)
        db.add(user_msg)
        db.commit()

        history = (
            db.query(ChatMessage)
            .order_by(ChatMessage.created_at.asc())
            .limit(20)
            .all()
        )

        # 4. Load active reminders
        reminders = (
            db.query(Reminder)
            .filter(Reminder.completed == False)
            .order_by(Reminder.time.asc())
            .limit(8)
            .all()
        )

        reminder_context = "\n".join([
            f"• {r.date or 'today'} {r.time or ''} | {r.context} | {r.text}"
            for r in reminders
        ]) or "No active reminders."

        # 5. System prompt
        system_prompt = f"""
You are Remindarin AI — a modern, intelligent productivity assistant.

Current active reminders:
{reminder_context}

You have full memory of the conversation.

When the user asks to add, create, schedule, remind, or set a reminder, you MUST create it.

Respond in clean professional Markdown.

If you create a reminder, ALWAYS end your response with this JSON block:

```json
{{
  "action": "create_reminder",
  "text": "exact reminder text",
  "time": "HH:MM",
  "date": "YYYY-MM-DD or null for today",
  "context": "Work / Personal / Health / Other"
}}
"""

        reply = await call_nvidia_ai(user_message, system_prompt)

        json_match = re.search(
            r"```json\s*(\{.*?\})\s*```",
            reply,
            re.DOTALL | re.IGNORECASE
        )

        if json_match:
            try:
                action = json.loads(json_match.group(1))

                if action.get("action") == "create_reminder":
                    reminder = Reminder(
                        text=action.get("text"),
                        time=action.get("time"),
                        date=action.get("date"),
                        context=action.get("context", "Work"),
                        completed=False
                    )

                    db.add(reminder)
                    db.commit()
                    db.refresh(reminder)

                    reply += (
                        f"\n\n✅ Reminder created! "
                        f"ID: {reminder.id} — "
                        f"{reminder.date or 'today'} {reminder.time or ''}"
                    )

            except Exception:
                pass
        assistant_msg = ChatMessage(role="assistant", content=reply)
        db.add(assistant_msg)
        db.commit()

        return JSONResponse({"reply": reply})

    finally:
        db.close()