from fastapi import APIRouter, HTTPException
from datetime import date
from app.services.supabase_client import supabase

router = APIRouter(prefix="/api/contracts", tags=["service-log"])


def compute_status(days_left: int):
    if days_left > 30:
        return "ACTIVE"
    if days_left > 0:
        return "EXPIRING"
    return "EXPIRED"


@router.get("/{contract_id}/service-log")
def get_service_log(contract_id: str):
    result = (
        supabase
        .table("service_log")
        .select(
            "service_code, service_name, expiry_date, days_left, status"
        )
        .eq("contract_id", contract_id)
        .execute()
    )

    if not result.data:
        return {
            "summary": { "active": 0, "expiring": 0, "expired": 0 },
            "services": []
        }

    summary = { "ACTIVE": 0, "EXPIRING": 0, "EXPIRED": 0 }

    for s in result.data:
        summary[s["status"]] += 1

    return {
        "summary": {
            "active": summary["ACTIVE"],
            "expiring": summary["EXPIRING"],
            "expired": summary["EXPIRED"]
        },
        "services": result.data
    }
