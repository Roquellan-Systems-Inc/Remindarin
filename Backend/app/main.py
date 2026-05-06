from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
import json

app = FastAPI(title="Remindarin AI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
MODEL = "nvidia/llama-3.1-nemotron-70b-instruct"

async def call_nvidia_ai(prompt: str, system_prompt: str = None):
    api_key = os.getenv("NVIDIA_API_KEY")
    if not api_key:
        return "AI service is currently unavailable. Please set your NVIDIA_API_KEY in Render environment variables."

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

@app.get("/")
async def root():
    return {
        "message": "Remindarin AI Backend is running",
        "status": "healthy",
        "region": "singapore"
    }

@app.post("/api/v1/chat")
async def chat_with_ai(request: dict):
    system_prompt = "You are Remindarin AI, a helpful assistant for reminders and productivity. Be concise, friendly, and context-aware."
    reply = await call_nvidia_ai(request.get("message", ""), system_prompt)
    return {"reply": reply}

@app.post("/api/v1/reminders/parse")
async def parse_reminder(request: dict):
    system_prompt = """Extract structured reminder data from the user's message.
Return ONLY valid JSON with these keys: text, time, location, priority, duration.
If any value is missing, use null. Priority can be low, medium, or high."""
    result = await call_nvidia_ai(request.get("text", ""), system_prompt)
    try:
        data = json.loads(result)
        return {"success": True, "reminder": data}
    except:
        return {"success": False, "error": "Failed to parse reminder", "raw": result}