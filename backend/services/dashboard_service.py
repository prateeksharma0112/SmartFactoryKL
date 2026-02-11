from basyx_client.aas import get_submodel
from utils.dashboard import extract_factory_info, extract_islands_count, extract_orders_summary

BOM_ID = "aHR0cHM6Ly9zbWFydGZhY3RvcnkuZGUvc3VibW9kZWxzLzBiZmJiNGMyLTk1MTAtNDMzNy04ODkzLWE1MGU4YTFkZDRmMjYw"
NAMEPLATE_ID = "aHR0cHM6Ly9zbWFydGZhY3RvcnkuZGUvc3VibW9kZWxzLzNkOGMzMTVhLTljMDMtNDlkMy05ZTMxLTM5Y2MyMTY5ODVjZjYw"
PRODUCTION_ORDERS_ID = "aHR0cHM6Ly9zbWFydGZhY3RvcnkuZGUvc3VibW9kZWxzLzIwOTRfMjE1MV8yMTUyXzA4NzY2MA"

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
