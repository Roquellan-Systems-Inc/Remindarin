from starlette.requests import Request
from starlette.responses import JSONResponse
import json
from nvidia_ai import call_nvidia_ai

async def parse_reminder(request: Request):
    try:
        body = await request.json()
    except:
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