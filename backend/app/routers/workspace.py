# backend/app/routers/workspace.py
from fastapi import APIRouter, Depends
from app.services.supabase_client import supabase

router = APIRouter(prefix="/api/workspace", tags=["workspace"])

@router.get("/summary")
def get_workspace_summary(institution_id: str):
    # institution
    institution = (
        supabase
        .table("institutions")
        .select("id, name")
        .eq("id", institution_id)
        .single()
        .execute()
    )

    # counts (mock for now)
    contracts_count = 0
    clients_count = 0

    return {
        "institution": institution.data,
        "metrics": {
            "contracts": contracts_count,
            "clients": clients_count,
            "pricing_catalogue": "not_configured"
        }
    }
