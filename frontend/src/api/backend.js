const BASE_URL = "http://localhost:8000";

export async function fetchSubmodels() {
  const response = await fetch(`${BASE_URL}/submodels`);
  return response.json();
}

