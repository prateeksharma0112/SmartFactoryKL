import base64
import requests

# Utility function to get machine idShort from AssignedResourceRef URL
def get_machine_id(resource_url: str) -> str:
    encoded = base64.urlsafe_b64encode(resource_url.encode()).decode()
    endpoint = f"http://localhost:8081/shells/{encoded}"
    resp = requests.get(endpoint)
    if resp.status_code == 200:
        data = resp.json()
        return data.get("idShort", "UnknownMachine")
    return "UnknownMachine"



def extract_production_plan(production_orders_submodel: dict) -> dict:
    machines = {}
    
    # Get the main Orders list
    orders = next((elem.get("value", []) for elem in production_orders_submodel.get("submodelElements", []) 
                   if elem.get("idShort") == "Orders"), [])

    for order in orders:
        order_id = "Unknown"
        operations_list = []

        # Find OrderID and the Operations list inside the Order
        for subelem in order.get("value", []):
            if subelem.get("idShort") == "OrderInfo":
                order_id = next((p.get("value") for p in subelem.get("value", []) 
                                if p.get("idShort") == "OrderID"), "Unknown")
            if subelem.get("idShort") == "Operations":
                operations_list = subelem.get("value", [])

        for op_smc in operations_list:
            op_values = op_smc.get("value", [])
            
            # Reset variables for each operation
            op_id, op_status, is_frozen = None, "Unknown", False
            machine_url, start, end = None, None, None

            # Traverse the Operation SMC
            for prop in op_values:
                pid = prop.get("idShort")
                if pid == "OperationID":
                    op_id = prop.get("value")
                elif pid == "IsFrozen":
                    is_frozen = str(prop.get("value")).lower() == "true"
                elif pid == "OperationStatus":
                    op_status = prop.get("value")
                elif pid == "Schedule":
                    # Look inside Schedule for Resource and Times
                    for s_prop in prop.get("value", []):
                        sid = s_prop.get("idShort")
                        if sid == "AssignedResourceRef":
                            keys = s_prop.get("value", {}).get("keys", [])
                            if keys: machine_url = keys[0].get("value")
                        elif sid == "PlannedStartDateTime":
                            start = s_prop.get("value")
                        elif sid == "PlannedEndDateTime":
                            end = s_prop.get("value")

            if machine_url and start:
                m_name = get_machine_id(machine_url)
                if m_name not in machines: machines[m_name] = []
                
                machines[m_name].append({
                    "orderId": order_id,
                    "operationId": op_id,
                    "start": start,
                    "end": end,
                    "status": op_status,
                    "isFrozen": is_frozen
                })

    return {
        "machines": [{"machineId": m, "operations": ops} for m, ops in machines.items()]
    }