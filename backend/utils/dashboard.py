# Utility functions to extract dashboard info from AAS submodels
def extract_islands_count(bom: dict) -> int:
    try:
        factory_entity = bom["submodelElements"][0]
        islands = factory_entity.get("statements", [])
        return len(islands)
    except Exception:
        return 0


# Function to extract factory info from Nameplate submodel
def extract_factory_info(nameplate: dict) -> dict:
    elements = nameplate.get("submodelElements", [])

    def find(id_short):
        return next((e for e in elements if e.get("idShort") == id_short), None)

    name_el = find("ManufacturerName")
    country_el = find("CountryOfOrigin")
    uid_el = find("UniqueFacilityIdentifier")

    return {
        "name": name_el["value"][0]["text"].replace('"', "") if name_el else "Factory",
        "country": country_el["value"] if country_el else "Unknown",
        "uniqueId": uid_el["value"] if uid_el else "N/A",
    }


# Function to extract orders summary
def extract_orders_summary(production_orders_submodel):
    orders = []

    # Step 1: Find the Orders list
    for elem in production_orders_submodel.get("submodelElements", []):
        if elem.get("idShort") == "Orders" and elem.get("value"):
            orders = elem["value"]
            break

    total = len(orders)
    print("Total Orders:", total)

    planned = 0
    running = 0
    finished = 0

    # Step 2: Go through each order
    for order in orders:
        OrderInfo = None

        # Each order is a SubmodelElementCollection
        for subelem in order.get("value", []):
            if subelem.get("idShort") == "OrderInfo":
                OrderInfo = subelem
                break

        if not OrderInfo:
            continue

        # Step 3: Get OrderStatus
        status = None
        for prop in OrderInfo.get("value", []):
            if prop.get("idShort") == "OrderStatus":
                status = prop.get("value")
                break

        if status == "planned":
            planned += 1
        elif status == "running":
            running += 1
        elif status == "finished":
            finished += 1

    return {
        "total": total,
        "planned": planned,
        "running": running,
        "finished": finished,
    }
