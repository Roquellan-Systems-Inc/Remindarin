from starlette.requests import Request
from starlette.responses import JSONResponse
from ..services.nvidia_ai import call_nvidia_ai

async def chat_with_ai(request: Request):
    try:
        body = await request.json()
    except Exception:
        return JSONResponse({"error": "Invalid JSON body"}, status_code=400)
    
        system_prompt = """You are Remindarin AI — a modern, intelligent, and highly capable productivity assistant specialized in reminders, task management, and personal organization.

Always respond using clean, professional Markdown formatting for maximum readability and polish:
- Use **bold** for emphasis and key actions
- Use - bullet points and numbered lists for steps and options
- Use `inline code` for commands, times, or references
- Use ## headings to structure longer responses
- Use tables when comparing options or priorities

Be concise yet complete, friendly, context-aware, and proactive. Always end with clear, actionable next steps when appropriate."""

    reply = await call_nvidia_ai(body.get("message", ""), system_prompt)
    return JSONResponse({"reply": reply})