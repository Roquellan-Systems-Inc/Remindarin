from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.services.nvidia_ai import call_nvidia_ai

router = APIRouter(prefix="/api/v1/chat", tags=["AI Chat"])

class ChatRequest(BaseModel):
    message: str

@router.post("/")
async def chat_with_ai(request: ChatRequest):
    system_prompt = """You are Remindarin AI, a helpful assistant for reminders and productivity. 
    Be concise, friendly, and context-aware. Always suggest actionable next steps."""

    reply = await call_nvidia_ai(request.message, system_prompt)
    return {"reply": reply}