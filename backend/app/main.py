from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import workspace 
from app.routers import pricing_catalogue
from app.routers import contracts
from app.routers import clients


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


@app.get("/health")
def health_check():
    print("DEBUG: Health check endpoint hit")
    return {"status": "ok"}
