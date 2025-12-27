from fastapi import APIRouter
from app.services.supabase_client import supabase

router = APIRouter(prefix="/api/clients", tags=["clients"])

@router.get("")
def list_clients(
    institution_id: str,
    search: str | None = None,
    limit: int = 20,
    cursor: str | None = None,
):
    query = (
        supabase
        .table("clients")
        .select("id, name", count="exact")
        .eq("institution_id", institution_id)
        .order("id")
        .limit(limit)
    )

    if cursor:
        query = query.gt("id", cursor)

    if search:
        query = query.ilike("name", f"%{search}%")

    res = query.execute()

    data = res.data or []
    next_cursor = data[-1]["id"] if len(data) == limit else None

    return {
        "data": data,
        "next_cursor": next_cursor,
        "total": res.count
    }


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

