# Main application entry point
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes_api import router as api_router
from app.api.routes_health import router as health_router
from app.db.init_db import init_db

app = FastAPI(title="PAGASA Weather Decision Support Demo")

@app.on_event("startup")
def startup():
    init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://server4.gmstdevops.com",
        "https://server4.gmstdevops.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/data", StaticFiles(directory="data"), name="data")

app.include_router(api_router, prefix="/api")
app.include_router(health_router)