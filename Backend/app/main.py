from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from starlette.routing import Route
from .chat import chat_with_ai
from .reminders import parse_reminder

async def root(request):
    return JSONResponse({
        "message": "Remindarin AI Backend is running",
        "status": "healthy",
        "region": "singapore"
    })

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)