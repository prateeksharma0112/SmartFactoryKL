from typing import List
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from ws_endpoints.dashboard_ws import dashboard_endpoint
from services.dashboard_service import build_dashboard
from ws_endpoints.productionPlan_ws import productionPlan_endpoint
from config import CORS_ORIGINS

app = FastAPI(title="WEB GUI for AAS - Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
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

@app.websocket("/ws/production_plan")
async def productionPlan(websocket: WebSocket):
    await productionPlan_endpoint(websocket)
