# app/websockets/manager.py
import asyncio
from typing import List
from fastapi import WebSocket, WebSocketDisconnect

class WebSocketManager:
    def __init__(self):
        self.connected_clients: List[WebSocket] = []
        print("WebSocketManager initialized.")

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.connected_clients.append(websocket)
        print(f"Client connected: {websocket.client}")

    def disconnect(self, websocket: WebSocket):
        self.connected_clients.remove(websocket)
        print(f"Client disconnected: {websocket.client}")

    async def broadcast(self, data):
        for client in self.connected_clients:
            try:
                await client.send_json(data)
            except:
                self.disconnect(client)

    async def send_periodic_updates(self, websocket: WebSocket, get_data_callback, interval=5):
        """Send data to a client periodically"""
        try:
            while True:
                await asyncio.sleep(interval)
                data = get_data_callback()
                await websocket.send_json(data)
        except WebSocketDisconnect:
            self.disconnect(websocket)
