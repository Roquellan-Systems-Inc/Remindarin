from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from starlette.routing import Route
from .routers.chat import chat_with_ai
from .routers.reminders import parse_reminder, list_reminders, create_reminder, complete_reminder, get_dashboard
from .routers.auth import auth_router, require_auth
from .routers.suggestions import get_smart_suggestions
from .database import Base, engine

async def root(request):
    return JSONResponse({
        "message": "Remindarin AI Backend is running",
        "status": "healthy",
        "region": "singapore"
    })

Base.metadata.create_all(bind=engine)

from .database import Reminder
Base.metadata.drop_all(bind=engine, tables=[Reminder.__table__])
Base.metadata.create_all(bind=engine)

app = Starlette(debug=True, routes=[
    Route("/", root, methods=["GET"]),
    Route("/api/v1/chat", chat_with_ai, methods=["POST"]),
    Route("/api/v1/dashboard", get_dashboard, methods=["GET"]),
    Route("/api/v1/reminders", list_reminders, methods=["GET"]),
    Route("/api/v1/reminders", create_reminder, methods=["POST"]),
    Route("/api/v1/reminders/{reminder_id}/complete", complete_reminder, methods=["PATCH"]),
    Route("/api/v1/suggestions", get_smart_suggestions, methods=["GET"]),
])

app.mount("/api/v1/auth", auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)