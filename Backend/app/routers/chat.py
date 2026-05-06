from starlette.requests import Request
from starlette.responses import JSONResponse
from ..services.nvidia_ai import call_nvidia_ai
from ..database import SessionLocal, ChatMessage, Reminder
from sqlalchemy import desc

async def chat_with_ai(request: Request):
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

        history = db.query(ChatMessage)\
            .order_by(ChatMessage.created_at.asc())\
            .limit(20).all()

        reminders = db.query(Reminder)\
            .filter(Reminder.completed == False)\
            .order_by(Reminder.time.asc())\
            .limit(8).all()

        reminder_context = "\n".join([
            f"• {r.time or 'anytime'} | {r.context} | {r.text}"
            for r in reminders
        ]) or "No active reminders."

        system_prompt = f"""You are Remindarin AI — a modern, intelligent productivity assistant.

Current active reminders:
{reminder_context}

You have full memory of the conversation. Always be helpful, concise, and proactive about tasks/reminders.
Respond in clean professional Markdown. Use bold, bullets, and tables when helpful."""

        messages = [{"role": "system", "content": system_prompt}]
        for msg in history:
            messages.append({"role": msg.role, "content": msg.content})

        reply = await call_nvidia_ai(user_message, system_prompt)

        assistant_msg = ChatMessage(role="assistant", content=reply)
        db.add(assistant_msg)
        db.commit()

        return JSONResponse({"reply": reply})

    finally:
        db.close()