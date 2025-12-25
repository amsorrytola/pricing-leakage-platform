from fastapi import APIRouter
from app.services.supabase_client import supabase

router = APIRouter(prefix="/api/clients", tags=["clients"])

@router.get("/")
def list_clients(institution_id: str):
    print("DEBUG: Listing clients for institution", institution_id)

    result = (
        supabase
        .table("clients")
        .select("id, name, created_at")
        .eq("institution_id", institution_id)
        .order("created_at", desc=True)
        .execute()
    )

    return result.data
