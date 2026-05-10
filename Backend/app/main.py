from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from starlette.routing import Route, WebSocketRoute
from starlette.websockets import WebSocket
from .routers.chat import chat_with_ai
from .routers.reminders import parse_reminder, list_reminders, create_reminder, complete_reminder, get_dashboard
from .routers.auth import auth_router, require_auth
from .routers.suggestions import get_smart_suggestions
from .routers.push import push_router, process_due_reminders
from .database import Base, engine
from .services.realtime import manager
import asyncio

async def root(request):
    return JSONResponse({
        "message": "Remindarin AI Backend is running",
        "status": "healthy",
        "region": "singapore"
    })

Base.metadata.create_all(bind=engine)

async def websocket_endpoint(websocket: WebSocket):
    """Authenticated real-time WebSocket.
    Connect: wss://accounts.remindarin.orbmiv.com/ws?token=BASE64_USER_TOKEN
    Emits: reminder_created, reminder_completed, reminder_due, connected
    """
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008, reason="Authentication required")
        return
    try:
        import base64
        decoded = base64.b64decode(token).decode()
        user_id_str, _ = decoded.split(":", 1)
        user_id = int(user_id_str)
    except Exception:
        await websocket.close(code=1008, reason="Invalid token")
        return

    await manager.connect(websocket, user_id)
    try:
        await websocket.send_json({
            "type": "connected",
            "message": "🟢 Real-time sync active — live reminders & AI updates enabled",
            "user_id": user_id
        })
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "ping":
                await websocket.send_json({"type": "pong", "ts": data.get("ts")})
    except Exception as e:
        print(f"WS disconnect user {user_id}: {str(e)[:80]}")
    finally:
        manager.disconnect(websocket, user_id)

app = Starlette(debug=True, routes=[
    Route("/", root, methods=["GET"]),
    Route("/api/v1/chat", chat_with_ai, methods=["POST"]),
    Route("/api/v1/dashboard", get_dashboard, methods=["GET"]),
    Route("/api/v1/reminders", list_reminders, methods=["GET"]),
    Route("/api/v1/reminders", create_reminder, methods=["POST"]),
    Route("/api/v1/reminders/{reminder_id}/complete", complete_reminder, methods=["PATCH"]),
    Route("/api/v1/suggestions", get_smart_suggestions, methods=["GET"]),
    WebSocketRoute("/ws", websocket_endpoint),
])

app.mount("/api/v1/auth", auth_router)
app.mount("/api/v1/push", push_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

async def scheduler_loop():
    """Send push notifications for reminders that are due right now."""
    while True:
        try:
            sent = await process_due_reminders()
            if sent:
                print(f"📨 Sent {sent} push notification(s)")
        except Exception as e:
            print(f"Scheduler error: {e}")
        await asyncio.sleep(30)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(scheduler_loop())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)