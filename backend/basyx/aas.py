import requests

SUBMODEL_URL = "http://localhost:8081/submodels"

def list_submodels():
    response = requests.get(SUBMODEL_URL)
    response.raise_for_status()

    data = response.json()
    return data.get("result", [])
