# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import workspace 
from app.routers import pricing_catalogue
from app.routers import contracts
from app.routers import clients
from app.routers import normalize
from app.routers import leakage
from app.routers import chat
from app.routers import dashboard
from app.routers import volume
from app.routers import service_log
from app.routers import revenue_volume
from app.routers import revenue_analytics





app = FastAPI(
    title="Pricing Leakage Platform API",
    version="0.1.0"
)

# ======================
# CORS CONFIG (DEV ONLY)
# ======================

print("DEBUG: Initializing CORS middleware")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # frontend dev server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("DEBUG: CORS middleware configured")

# ======================
# ROUTERS
# ======================

app.include_router(workspace.router)
app.include_router(pricing_catalogue.router)
app.include_router(contracts.router)
app.include_router(clients.router)
app.include_router(normalize.router)
app.include_router(leakage.router)
app.include_router(chat.router)
app.include_router(dashboard.router)
app.include_router(volume.router)
app.include_router(service_log.router)
app.include_router(revenue_volume.router)
app.include_router(revenue_analytics.router)






@app.get("/health")
def health_check():
    print("DEBUG: Health check endpoint hit")
    return {"status": "ok"}
