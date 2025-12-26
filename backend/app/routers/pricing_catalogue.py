# backend/app/routers/pricing_catalogue.py
from fastapi import APIRouter
from app.services.supabase_client import supabase
from app.schemas.pricing_catalogue import PricingCatalogueCreate

router = APIRouter(
    prefix="/api/pricing-catalogue",
    tags=["pricing-catalogue"]
)

@router.post("/")
def create_pricing_catalogue(payload: PricingCatalogueCreate):
    print("DEBUG: Creating pricing catalogue")
    print("DEBUG: Payload received:", payload)

    result = (
        supabase
        .table("pricing_catalogues")
        .insert({
            "institution_id": payload.institution_id,
            "name": payload.name,
            "rules": payload.rules,
            "status": "draft"
        })
        .execute()
    )

    print("DEBUG: Pricing catalogue created:", result.data)

    return result.data[0]


@router.get("/active")
def get_active_pricing_catalogue(institution_id: str):
    print("DEBUG: Fetching active pricing catalogue")

    result = (
        supabase
        .table("pricing_catalogues")
        .select("*")
        .eq("institution_id", institution_id)
        .eq("status", "active")
        .limit(1)
        .execute()
    )

    return result.data


@router.post("/activate")
def activate_pricing_catalogue(catalogue_id: str):
    print("DEBUG: Activating pricing catalogue", catalogue_id)

    # 1️⃣ Fetch catalogue to get institution_id
    existing = (
        supabase
        .table("pricing_catalogues")
        .select("id, institution_id")
        .eq("id", catalogue_id)
        .single()
        .execute()
    )

    institution_id = existing.data["institution_id"]

    # 2️⃣ Deactivate all other catalogues for institution
    supabase.table("pricing_catalogues") \
        .update({"status": "draft"}) \
        .eq("institution_id", institution_id) \
        .execute()

    # 3️⃣ Activate selected catalogue
    result = (
        supabase
        .table("pricing_catalogues")
        .update({"status": "active"})
        .eq("id", catalogue_id)
        .execute()
    )

    print("DEBUG: Catalogue activated")

    return result.data[0]

