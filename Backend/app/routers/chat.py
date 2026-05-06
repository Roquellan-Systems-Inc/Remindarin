from starlette.requests import Request
from starlette.responses import JSONResponse
from nvidia_ai import call_nvidia_ai

async def chat_with_ai(request: Request):
    try:
        body = await request.json()
    except Exception:
        return JSONResponse({"error": "Invalid JSON body"}, status_code=400)
    
    system_prompt = """You are Remindarin AI, a helpful assistant for reminders and productivity. 
Be concise, friendly, and context-aware. Always suggest actionable next steps."""

    reply = await call_nvidia_ai(body.get("message", ""), system_prompt)
    return JSONResponse({"reply": reply})