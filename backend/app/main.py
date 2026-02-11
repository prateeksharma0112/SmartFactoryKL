import asyncio
from typing import List
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from ws_endpoints.dashboard_ws import dashboard_endpoint
from services.dashboard_service import build_dashboard

app = FastAPI(title="WEB GUI for AAS - Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health():
    return {"status": "backend running"}


@app.get("/dashboard")
async def get_dashboard():
    """HTTP endpoint for dashboard snapshot (appears in /docs)"""
    return build_dashboard()

# WebSocket endpoint
@app.websocket("/ws/dashboard")
async def dashboard_ws(websocket: WebSocket):
    await dashboard_endpoint(websocket)
