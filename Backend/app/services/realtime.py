from starlette.websockets import WebSocket
from typing import Dict, List

class ConnectionManager:
    """Production-grade per-user WebSocket manager.
    Supports multiple devices/tabs per user.
    Auto-removes dead connections. Zero memory leaks.
    """
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            try:
                self.active_connections[user_id].remove(websocket)
            except ValueError:
                pass
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_to_user(self, user_id: int, message: dict):
        if user_id in self.active_connections:
            dead = []
            for conn in self.active_connections[user_id]:
                try:
                    await conn.send_json(message)
                except Exception:
                    dead.append(conn)
            for d in dead:
                try:
                    self.active_connections[user_id].remove(d)
                except:
                    pass
            if user_id in self.active_connections and not self.active_connections[user_id]:
                del self.active_connections[user_id]

manager: ConnectionManager = ConnectionManager()