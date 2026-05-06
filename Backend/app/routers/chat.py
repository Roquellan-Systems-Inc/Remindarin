from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/chat", tags=["AI Chat"])

class ChatRequest(BaseModel):
    message: str

@router.post("/")
async def chat_with_ai(request: ChatRequest):
    # Lazy import to avoid startup crashes
    from app.services.nvidia_ai import call_nvidia_ai
    
    system_prompt = """You are Remindarin AI, a helpful assistant for reminders and productivity. 
    Be concise, friendly, and context-aware. Always suggest actionable next steps."""

    reply = await call_nvidia_ai(request.message, system_prompt)
    return {"reply": reply}