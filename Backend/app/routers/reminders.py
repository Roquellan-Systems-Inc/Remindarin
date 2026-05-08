from .auth import require_auth
from starlette.requests import Request
from starlette.responses import JSONResponse
import json
from ..services.nvidia_ai import call_nvidia_ai
from ..database import SessionLocal, Reminder

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
    auth = await require_auth(request)
    if isinstance(auth, JSONResponse):
        return auth
    db = SessionLocal()
    try:
        reminders = db.query(Reminder).filter(
            Reminder.completed == False,
            Reminder.user_id == auth["user_id"]
        ).order_by(Reminder.time.asc()).all()
        reminder_list = [
            {
                "id": r.id,
                "text": r.text,
                "time": r.time,
                "date": r.date,
                "context": r.context,
                "completed": r.completed
            } for r in reminders
        ]
        return JSONResponse({"reminders": reminder_list})
    finally:
        db.close()

async def create_reminder(request):
    auth = await require_auth(request)
    if isinstance(auth, JSONResponse):
        return auth
    try:
        body = await request.json()
    except Exception:
        return JSONResponse({"success": False, "error": "Invalid JSON body"}, status_code=400)
    db = SessionLocal()
    try:
        reminder = Reminder(
            user_id=auth["user_id"],
            text=body.get("text"),
            time=body.get("time"),
            date=body.get("date"),
            context=body.get("context", "Work"),
            notified=False
        )
        db.add(reminder)
        db.commit()
        db.refresh(reminder)
        return JSONResponse({"success": True, "reminder": {
            "id": reminder.id,
            "text": reminder.text,
            "time": reminder.time,
            "date": reminder.date,
            "context": reminder.context,
            "completed": reminder.completed
        }})
    finally:
        db.close()   # FIXED: removed extra ')'

async def complete_reminder(request):
    auth = await require_auth(request)
    if isinstance(auth, JSONResponse):
        return auth
    reminder_id = int(request.path_params.get("reminder_id"))
    db = SessionLocal()
    try:
        reminder = db.query(Reminder).filter(
            Reminder.id == reminder_id,
            Reminder.user_id == auth["user_id"]
        ).first()
        if not reminder:
            return JSONResponse({"success": False, "error": "Reminder not found"}, status_code=404)
        reminder.completed = True
        db.commit()
        return JSONResponse({"success": True})
    finally:
        db.close()

async def get_dashboard(request):
    auth = await require_auth(request)
    if isinstance(auth, JSONResponse):
        return auth
    db = SessionLocal()
    try:
        reminders = db.query(Reminder).filter(
            Reminder.completed == False,
            Reminder.user_id == auth["user_id"]
        ).order_by(Reminder.time.asc()).all()
        reminder_list = [
            {
                "id": r.id,
                "text": r.text,
                "time": r.time,
                "date": r.date,
                "context": r.context,
                "completed": r.completed
            } for r in reminders
        ]
        completed_today = db.query(Reminder).filter(Reminder.completed == True).count()

        import httpx
        from datetime import datetime
        now = datetime.now()

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                weather_resp = await client.get(
                    "https://api.open-meteo.com/v1/forecast",
                    params={
                        "latitude": 9.7392,
                        "longitude": 118.7353,
                        "current_weather": "true",
                        "timezone": "Asia/Manila"
                    }
                )
                weather_data = weather_resp.json().get("current_weather", {})
                temp = round(weather_data.get("temperature", 28))
                wcode = weather_data.get("weathercode", 0)
                condition_map = {
                    0: "Clear skies", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
                    45: "Fog", 48: "Depositing rime fog", 51: "Light drizzle", 53: "Moderate drizzle",
                    55: "Dense drizzle", 61: "Light rain", 63: "Moderate rain", 65: "Heavy rain",
                    71: "Light snow", 73: "Moderate snow", 75: "Heavy snow", 95: "Thunderstorm"
                }
                condition = condition_map.get(wcode, "Cloudy")
                weather = {"temp": temp, "condition": condition}
        except:
            weather = {"temp": 28, "condition": "Cloudy"}

        hour = now.hour
        if completed_today >= 5 or (hour >= 6 and hour <= 10):
            energy_level = "high"
        elif completed_today >= 2 or (hour >= 11 and hour <= 15):
            energy_level = "medium"
        else:
            energy_level = "low"

        return JSONResponse({
            "weather": weather,
            "energy_level": energy_level,
            "reminders": reminder_list,
            "completed_today": completed_today,
            "streak": 12
        })
    finally:
        db.close()
