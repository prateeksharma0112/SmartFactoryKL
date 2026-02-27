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
    orders_output = []

    # Step 1: Find Orders list
    orders = []
    for elem in production_orders_submodel.get("submodelElements", []):
        if elem.get("idShort") == "Orders" and elem.get("value"):
            orders = elem["value"]
            break

    # Step 2: Iterate Orders
    for order in orders:
        order_id = None
        operations_output = []

        operations = []

        # Extract OrderID and Operations
        for subelem in order.get("value", []):
            if subelem.get("idShort") == "OrderInfo":
                for prop in subelem.get("value", []):
                    if prop.get("idShort") == "OrderID":
                        order_id = prop.get("value")

            if subelem.get("idShort") == "Operations":
                operations = subelem.get("value", [])

        # Step 3: Iterate Operations
        for operation in operations:
            operation_id = None
            schedule = None

            for op_elem in operation.get("value", []):
                if op_elem.get("idShort") == "OperationID":
                    operation_id = op_elem.get("value")

                if op_elem.get("idShort") == "Schedule":
                    schedule = op_elem

            if not schedule:
                continue

            machine_url = None
            start_time = None
            end_time = None

            for sched_prop in schedule.get("value", []):
                if sched_prop.get("idShort") == "AssignedResourceRef":
                    keys = sched_prop.get("value", {}).get("keys", [])
                    if keys:
                        machine_url = keys[0].get("value")

                if sched_prop.get("idShort") == "PlannedStartDateTime":
                    start_time = sched_prop.get("value")

                if sched_prop.get("idShort") == "PlannedEndDateTime":
                    end_time = sched_prop.get("value")

            if not machine_url or not start_time or not end_time:
                continue

            machine_no = get_machine_id(machine_url)

            operation_data = {
                "operationId": operation_id,
                "machineId": machine_no,
                "start": start_time,
                "end": end_time
            }

            # Add to order-wise structure
            operations_output.append(operation_data)

            #  Add to machine-wise structure
            if machine_no not in machines:
                machines[machine_no] = []

            machines[machine_no].append({
                "orderId": order_id,
                "operationId": operation_id,
                "start": start_time,
                "end": end_time
            })

        # After processing operations → append order
        if order_id:
            orders_output.append({
                "orderId": order_id,
                "operations": operations_output
            })

    return {
        "orders": orders_output,
        "machines": [
            {"machineId": machine, "operations": ops}
            for machine, ops in machines.items()
        ]
    }