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


@router.get("/clients")
def leakage_by_client(institution_id: str):
    print("DEBUG: Aggregating leakage by client")

    rows = (
        supabase
        .table("revenue_leakage_findings")
        .select("client_id, findings")
        .eq("institution_id", institution_id)
        .execute()
    ).data

    summary = {}

    for row in rows:
        cid = row["client_id"]
        summary.setdefault(cid, 0)
        summary[cid] += len(row["findings"])

    return summary

