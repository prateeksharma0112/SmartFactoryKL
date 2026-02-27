from basyx_client.aas import get_submodel
from utils.productionPlan import extract_production_plan

PRODUCTION_ORDERS_ID = "aHR0cHM6Ly9zbWFydGZhY3RvcnkuZGUvc3VibW9kZWxzLzIwOTRfMjE1MV8yMTUyXzA4NzY2MA"

def build_productionPlan() -> dict:
    production_orders = get_submodel(PRODUCTION_ORDERS_ID)
    extracted_plan = extract_production_plan(production_orders)

    return {
        "ProductionPlan": extracted_plan
    }
