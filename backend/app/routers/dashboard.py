from fastapi import APIRouter
from app.services.supabase_client import supabase

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary")
def dashboard_summary(institution_id: str):
    print("DEBUG: Building dashboard summary for", institution_id)

    findings = (
        supabase
        .table("revenue_leakage_findings")
        .select("findings, client_id")
        .eq("institution_id", institution_id)
        .execute()
    ).data

    total_findings = 0
    high_severity = 0

    for row in findings:
        for f in row["findings"]:
            total_findings += 1
            if f["severity"] == "high":
                high_severity += 1

    return {
        "total_findings": total_findings,
        "high_severity_findings": high_severity,
        "clients_impacted": len(set(row["client_id"] for row in findings))
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
