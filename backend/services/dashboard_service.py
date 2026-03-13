from basyx_client.aas import get_submodel
from utils.dashboard import extract_factory_info, extract_islands_count, extract_orders_summary
from config import BOM_ID, NAMEPLATE_ID, PRODUCTION_ORDERS_ID

def build_dashboard() -> dict:
    nameplate = get_submodel(NAMEPLATE_ID)
    bom = get_submodel(BOM_ID)
    production_orders = get_submodel(PRODUCTION_ORDERS_ID)

    factory = extract_factory_info(nameplate)
    factory["islandsCount"] = extract_islands_count(bom)

    return {
        "factory": factory,
        "orders": extract_orders_summary(production_orders)
    }
