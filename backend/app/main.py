from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from basyx.aas import list_submodels
app = FastAPI(title="SFD Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health():
    return {"status": "backend running"}

@app.get("/submodels")
def get_submodels():
    return list_submodels()
