from pydantic import BaseModel
from typing import List, Optional


class Factory(BaseModel):
    name: str
    country: Optional[str] = "Unknown"
    uniqueId: Optional[str] = "N/A"
    islandsCount: int

class DashboardResponse(BaseModel):
    factory: Factory
    orders: Orders

class Orders(BaseModel):
    total: int
    planned: int
    running: int
    finished: int