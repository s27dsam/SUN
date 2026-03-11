"""
Local Development Server

This script acts as a master FastAPI application that imports and combines 
the two separate AWS Lambda FastAPI applications created by Chris.

Run with:
    uvicorn dev_server:app --reload
"""

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import importlib.util
import sys
import os

app = FastAPI(title="Sun Safety Local Dev Server")

# ── Middleware ────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Dynamic Import of Lambda Apps ─────────────────────────────────────────────
# We dynamically import the apps from the lambdas directory to avoid path issues
def load_lambda_app(module_path):
    spec = importlib.util.spec_from_file_location("main", module_path)
    module = importlib.util.module_from_spec(spec)
    sys.modules["main"] = module
    spec.loader.exec_module(module)
    return module.app

# Mount the RDS lambda to handle database queries
rds_app = load_lambda_app(os.path.join("lambdas", "RDS-lambda", "main.py"))
app.mount("/rds", rds_app)

# Mount the UV lambda to handle open-meteo proxying
uv_app = load_lambda_app(os.path.join("lambdas", "uv-lambda", "main.py"))
app.mount("/uv", uv_app)

# ── Frontend Serving ──────────────────────────────────────────────────────────
# Mount the frontend directory so we can load JS/CSS natively from root
app.mount("/", StaticFiles(directory="frontend", html=True), name="static")

@app.get("/", include_in_schema=False)
def index():
    return FileResponse("frontend/index.html")

