from starlette.requests import Request
from starlette.responses import JSONResponse
from ..services.nvidia_ai import call_nvidia_ai
from ..database import SessionLocal, ChatMessage, Reminder
from .auth import require_auth
from datetime import datetime
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
        # Save user message
        user_msg = ChatMessage(role="user", content=user_message)
        db.add(user_msg)
        db.commit()
        db.refresh(user_msg)

        # Load conversation history
        history = db.query(ChatMessage)\
            .order_by(ChatMessage.created_at.asc())\
            .limit(20).all()

        # Load active reminders for context
        reminders = db.query(Reminder)\
            .filter(Reminder.completed == False)\
            .order_by(Reminder.time.asc())\
            .limit(8).all()

        reminder_context = "\n".join([
            f"• {r.date or 'today'} {r.time or ''} | {r.context} | {r.text}"
            for r in reminders
        ]) or "No active reminders."

                # === REAL-TIME DATE & TIME INJECTION (for accurate reminders) ===
        now = datetime.now()
        current_date = now.strftime("%Y-%m-%d")
        current_time = now.strftime("%H:%M")
        current_weekday = now.strftime("%A")
        current_full = now.strftime("%A, %B %d, %Y at %I:%M %p")

        system_prompt = f"""You are Remindarin AI — a modern, intelligent productivity assistant.

CURRENT DATE AND TIME: {current_full} ({current_weekday})

Current active reminders:
{reminder_context}

You have full memory of the conversation. You can create new reminders instantly.

When the user asks to add, create, schedule, remind, or set a reminder, ALWAYS create it using the real current date/time above. 
Understand relative dates correctly:
- "tomorrow" = { (now.replace(hour=0, minute=0, second=0, microsecond=0) + datetime.timedelta(days=1)).strftime("%Y-%m-%d") }
- "next Monday" = calculate correctly from today
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

        json_match = re.search(r'```json\s*(\{.*?\})\s*```', reply, re.DOTALL | re.IGNORECASE)
        if json_match:
            try:
                action_data = json.loads(json_match.group(1))
                if action_data.get("action") == "create_reminder":
                    reminder = Reminder(
                        text=action_data.get("text", ""),
                        time=action_data.get("time"),
                        date=action_data.get("date"),
                        context=action_data.get("context", "Work")
                    )
                    db.add(reminder)
                    db.commit()
                    db.refresh(reminder)
                    
                    reply = re.sub(r'```json\s*\{.*?\}\s*```', '', reply, flags=re.DOTALL | re.IGNORECASE).strip()
                    reply += f"\n\n✅ **Reminder successfully created!**\n**ID:** {reminder.id} | {reminder.date or 'Today'} {reminder.time or ''} | {reminder.context}"
            except Exception:
                pass

        # Save AI response
        assistant_msg = ChatMessage(role="assistant", content=reply)
        db.add(assistant_msg)
        db.commit()

        return JSONResponse({"reply": reply})

    finally:
        db.close()