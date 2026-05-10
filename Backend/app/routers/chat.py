from starlette.requests import Request
from starlette.responses import JSONResponse
from ..services.nvidia_ai import call_nvidia_ai
from ..database import SessionLocal, ChatMessage, Reminder
from .auth import require_auth
from datetime import datetime, timedelta
import re
import json

async def chat_with_ai(request: Request):
    auth = await require_auth(request)
    if isinstance(auth, JSONResponse):
        return auth
    try:
        body = await request.json()
    except Exception:
        return JSONResponse({"error": "Invalid JSON body"}, status_code=400)

    user_message = body.get("message", "").strip()
    if not user_message:
        return JSONResponse({"error": "Message is required"}, status_code=400)

    db = SessionLocal()
    try:
        user_msg = ChatMessage(role="user", content=user_message)
        db.add(user_msg)
        db.commit()
        db.refresh(user_msg)

        # 🔒 FIX: filter reminders by the authenticated user
        reminders = db.query(Reminder)\
            .filter(Reminder.completed == False,
                    Reminder.user_id == auth["user_id"])\
            .order_by(Reminder.time.asc())\
            .limit(8).all()

        reminder_context = "\n".join([
            f"• {r.date or 'today'} {r.time or ''} | {r.context} | {r.text}"
            for r in reminders
        ]) or "No active reminders."

        now = datetime.now()
        tomorrow = (now.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)).strftime("%Y-%m-%d")
        current_full = now.strftime("%A, %B %d, %Y at %I:%M %p")
        current_weekday = now.strftime("%A")

        system_prompt = f"""You are Remindarin AI — a modern, intelligent productivity assistant.

CURRENT DATE AND TIME: {current_full} ({current_weekday})

Current active reminders:
{reminder_context}

You have full memory of the conversation. You can create new reminders instantly.

When the user asks to add, create, schedule, remind, or set a reminder, ALWAYS create it using the real current date/time above. 
Understand relative dates correctly:
- "tomorrow" = {tomorrow}
- "next week" = calculate from today
- "this afternoon" = today at appropriate time

Respond conversationally in clean professional Markdown.
If you create a reminder, end your response with this exact JSON block:

```json
{{
  "action": "create_reminder",
  "text": "exact reminder text",
  "time": "HH:MM",
  "date": "YYYY-MM-DD or null for today",
  "context": "Work / Personal / Health / Other"
}}

Be helpful, concise, friendly, and proactive."""

      reply = await call_nvidia_ai(user_message, system_prompt)

        json_match = re.search(r'```json\s*\n(.*?)\n\s*```', reply, re.DOTALL)
        if json_match:
            try:
                json_str = json_match.group(1).strip()
                action_data = json.loads(json_str)
                if action_data.get("action") == "create_reminder":
                    reminder = Reminder(
                        user_id=auth["user_id"],
                        text=action_data.get("text", ""),
                        time=action_data.get("time"),
                        date=action_data.get("date"),
                        context=action_data.get("context", "Work"),
                        notified=False
                    )
                    db.add(reminder)
                    db.commit()
                    db.refresh(reminder)

                    from ..services.realtime import manager
                    await manager.send_to_user(auth["user_id"], {
                        "type": "reminder_created",
                        "reminder": {
                            "id": reminder.id,
                            "text": reminder.text,
                            "time": reminder.time,
                            "date": reminder.date,
                            "context": reminder.context,
                            "completed": reminder.completed
                        },
                        "source": "ai_chat"
                    })

                    reply = re.sub(r'```json\s*\n.*?\n\s*```', '', reply, flags=re.DOTALL).strip()
                    reply += f"\n\n✅ **Reminder successfully created!**\n**ID:** {reminder.id} | {reminder.date or 'Today'} {reminder.time or ''} | {reminder.context}"
            except Exception as e:
                print(f"AI reminder action failed (non-critical): {str(e)[:120]}")

        assistant_msg = ChatMessage(role="assistant", content=reply)
        db.add(assistant_msg)
        db.commit()

        return JSONResponse({"reply": reply})

    finally:
        db.close()