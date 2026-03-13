import requests
from config import AAS_BASE_URL, AAS_SHELLS_URL

def get_submodel(submodel_id: str) -> dict:
    url = f"{AAS_BASE_URL}/submodels/{submodel_id}"
    response = requests.get(url)
    response.raise_for_status()
    return response.json()

def get_shell(shell_id: str) -> dict:
    url = f"{AAS_SHELLS_URL}/{shell_id}"
    response = requests.get(url)
    response.raise_for_status()
    return response.json()