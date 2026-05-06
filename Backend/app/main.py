from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import chat, reminders
from app.database import engine, Base
import os

app = FastAPI(title="Remindarin AI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(reminders.router)

@app.on_event("startup")
def startup():
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"⚠️ Database connection warning: {e}")

@app.get("/")
async def root():
    return {
        "message": "Remindarin AI Backend is running",
        "status": "healthy"
    }