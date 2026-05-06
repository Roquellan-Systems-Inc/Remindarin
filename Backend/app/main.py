from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from starlette.routing import Route
import httpx
import os
import json

NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
MODEL = "nvidia/llama-3.1-nemotron-70b-instruct"

async def call_nvidia_ai(prompt: str, system_prompt: str = None):
    api_key = os.getenv("NVIDIA_API_KEY")
    if not api_key:
        return "AI service is currently unavailable. Please set NVIDIA_API_KEY in Render environment variables."

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": MODEL,
        "messages": messages,
        "max_tokens": 1024,
        "temperature": 0.4,
        "top_p": 0.9
    }

    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            response = await client.post(NVIDIA_API_URL, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]
    except Exception:
        return "Sorry, I'm having trouble connecting to the AI right now."

async def root(request):
    return JSONResponse({
        "message": "Remindarin AI Backend is running",
        "status": "healthy",
        "region": "singapore"
    })

async def chat_with_ai(request):
    body = await request.json()
    system_prompt = "You are Remindarin AI, a helpful assistant for reminders and productivity. Be concise, friendly, and context-aware."
    reply = await call_nvidia_ai(body.get("message", ""), system_prompt)
    return JSONResponse({"reply": reply})

async def parse_reminder(request):
    body = await request.json()
    system_prompt = """Extract structured reminder data from the user's message.
Return ONLY valid JSON with these keys: text, time, location, priority, duration.
If any value is missing, use null. Priority can be low, medium, or high."""
    result = await call_nvidia_ai(body.get("text", ""), system_prompt)
    try:
        data = json.loads(result)
        return JSONResponse({"success": True, "reminder": data})
    except:
        return JSONResponse({"success": False, "error": "Failed to parse reminder", "raw": result})

app = Starlette(debug=True, routes=[
    Route("/", root, methods=["GET"]),
    Route("/api/v1/chat", chat_with_ai, methods=["POST"]),
    Route("/api/v1/reminders/parse", parse_reminder, methods=["POST"]),
])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)