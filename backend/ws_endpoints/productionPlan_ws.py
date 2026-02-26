from fastapi import WebSocket
from .manager import WebSocketManager
from services.productionPlan_service import build_productionPlan

dashboard_manager = WebSocketManager()

async def productionPlan_endpoint(websocket: WebSocket):
    await dashboard_manager.connect(websocket)
    await dashboard_manager.send_periodic_updates(websocket, build_productionPlan, interval=2)
