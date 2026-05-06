from starlette.requests import Request
from starlette.responses import JSONResponse
import json
from ..services.nvidia_ai import call_nvidia_ai
from .database import SessionLocal, Reminder

async def parse_reminder(request: Request):
    try:
        body = await request.json()
    except Exception:
        return JSONResponse({"success": False, "error": "Invalid JSON body"}, status_code=400)

    system_prompt = """Extract structured reminder data from the user's message.
Return ONLY valid JSON with these keys: text, time, location, priority, duration.
If any value is missing, use null. Priority can be low, medium, or high."""

    result = await call_nvidia_ai(body.get("text", ""), system_prompt)
    
    try:
        data = json.loads(result)
        return JSONResponse({"success": True, "reminder": data})
    except Exception:
        return JSONResponse({"success": False, "error": "Failed to parse reminder", "raw": result})

async def list_reminders(request):
    db = SessionLocal()
    try:
        reminders = db.query(Reminder).filter(Reminder.completed == False).order_by(Reminder.time.asc()).all()
        reminder_list = [
            {
                "id": r.id,
                "text": r.text,
                "time": r.time,
                "context": r.context,
                "completed": r.completed
            } for r in reminders
        ]
        return JSONResponse({"reminders": reminder_list})
    finally:
        db.close()

async def create_reminder(request):
    try:
        body = await request.json()
    except Exception:
        return JSONResponse({"success": False, "error": "Invalid JSON body"}, status_code=400)
    db = SessionLocal()
    try:
        reminder = Reminder(
            text=body.get("text"),
            time=body.get("time"),
            context=body.get("context", "Work")
        )
        db.add(reminder)
        db.commit()
        db.refresh(reminder)
        return JSONResponse({"success": True, "reminder": {
            "id": reminder.id,
            "text": reminder.text,
            "time": reminder.time,
            "context": reminder.context,
            "completed": reminder.completed
        }})
    finally:
        db.close()

async def complete_reminder(request):
    reminder_id = int(request.path_params.get("reminder_id"))
    db = SessionLocal()
    try:
        reminder = db.query(Reminder).filter(Reminder.id == reminder_id).first()
        if not reminder:
            return JSONResponse({"success": False, "error": "Reminder not found"}, status_code=404)
        reminder.completed = True
        db.commit()
        return JSONResponse({"success": True})
    finally:
        db.close()

async def get_dashboard(request):
    db = SessionLocal()
    try:
        reminders = db.query(Reminder).filter(Reminder.completed == False).order_by(Reminder.time.asc()).all()
        reminder_list = [
            {
                "id": r.id,
                "text": r.text,
                "time": r.time,
                "context": r.context,
                "completed": r.completed
            } for r in reminders
        ]
        completed_today = db.query(Reminder).filter(Reminder.completed == True).count()
        weather = {"temp": 29, "condition": "Clear skies"}
        return JSONResponse({
            "weather": weather,
            "energy_level": "medium",
            "reminders": reminder_list,
            "completed_today": completed_today,
            "streak": 12
        })
    finally:
        db.close()