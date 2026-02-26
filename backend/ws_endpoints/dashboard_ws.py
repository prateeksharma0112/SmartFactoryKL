from fastapi import WebSocket
from .manager import WebSocketManager
from services.dashboard_service import build_dashboard

dashboard_manager = WebSocketManager()

async def dashboard_endpoint(websocket: WebSocket):
    await dashboard_manager.connect(websocket)
    await dashboard_manager.send_periodic_updates(websocket, build_dashboard, interval=2)
