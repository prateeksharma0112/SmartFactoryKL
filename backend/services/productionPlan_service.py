from basyx_client.aas import get_submodel
from utils.productionPlan import extract_production_plan, normalize_time_to_minutes

PRODUCTION_ORDERS_ID = "aHR0cHM6Ly9zbWFydGZhY3RvcnkuZGUvc3VibW9kZWxzLzIwOTRfMjE1MV8yMTUyXzA4NzY2MA"

def build_productionPlan() -> dict:
    production_orders = get_submodel(PRODUCTION_ORDERS_ID)
    extracted_plan = extract_production_plan(production_orders)

    processed_plan = normalize_time_to_minutes({
        "orders": extracted_plan["orders"],
        "machines": extracted_plan["machines"]
    })
    return {
        "ProductionPlan": processed_plan
    }
