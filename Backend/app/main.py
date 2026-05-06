from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="Remindarin AI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers safely
try:
    from app.routers import chat, reminders
    app.include_router(chat.router)
    app.include_router(reminders.router)
    print("✅ Routers loaded successfully")
except Exception as e:
    print(f"⚠️ Router loading warning: {e}")

@app.on_event("startup")
def startup():
    print("✅ Remindarin AI Backend started successfully")

@app.get("/")
async def root():
    return {
        "message": "Remindarin AI Backend is running",
        "status": "healthy",
        "region": "singapore"
    }