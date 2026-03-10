"""
Run with:
    uvicorn main:app --reload
"""

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from backend.database import get_all_skin_mortality_data

app = FastAPI(title="Sun Safety Dashboard")
# ── Middleware ────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
# ── API endpoints ─────────────────────────────────────────────────────────────
@app.get("/api/get_all_skin_mortality_data")
def melanoma_data():
    return get_all_skin_mortality_data()

# ── Frontend Serving ──────────────────────────────────────────────────────────
app.mount("/", StaticFiles(directory="frontend", html=True), name="static")
@app.get("/", include_in_schema=False)

def index():
    return FileResponse("frontend/index.html")

# ── Health check ──────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}
