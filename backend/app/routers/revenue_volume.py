# backend/app/routers/revenue_volume.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.supabase_client import supabase
from app.services.revenue_engine import compute_revenue_impact
from datetime import datetime
from typing import List

router = APIRouter(
    prefix="/api/revenue",
    tags=["revenue-volume"]
)

# -----------------------------
# Schemas
# -----------------------------

class VolumeItem(BaseModel):
    service_code: str
    volume: float

class VolumeReportCreate(BaseModel):
    contract_id: str
    period: str            # e.g. "2025-01"
    services: List[VolumeItem]
    status: str = "draft"  # draft | final


# -----------------------------
# Submit Volume Report
# -----------------------------

@router.post("/volume-report")
def submit_volume_report(payload: VolumeReportCreate):
    if not payload.services:
        raise HTTPException(400, "No services provided")

    # Fetch contract to get institution & client
    contract = (
        supabase
        .table("contracts")
        .select("id, institution_id, client_id")
        .eq("id", payload.contract_id)
        .single()
        .execute()
    )

    if not contract.data:
        raise HTTPException(404, "Contract not found")

    rows = []

    for svc in payload.services:
        rows.append({
            "contract_id": payload.contract_id,
            "institution_id": contract.data["institution_id"],
            "client_id": contract.data["client_id"],
            "billing_period": payload.period,
            "service_code": svc.service_code,
            "volume": svc.volume,
            "created_at": datetime.utcnow().isoformat()
        })

    supabase.table("contract_volumes").insert(rows).execute()

    compute_revenue_impact(
        contract_id=payload.contract_id,
        period=payload.period
    )

    return {
        "status": "ok",
        "message": "Volume report saved",
        "period": payload.period,
        "count": len(rows)
    }


# -----------------------------
# List Volume Periods
# -----------------------------

@router.get("/volume-periods")
def list_volume_periods(contract_id: str):
    res = (
        supabase
        .table("contract_volumes")
        .select("billing_period")
        .eq("contract_id", contract_id)
        .execute()
    )

    periods = sorted({r["billing_period"] for r in res.data or []}, reverse=True)

    return { "periods": periods }


# -----------------------------
# Fetch Volume Report
# -----------------------------

@router.get("/volume-report")
def get_volume_report(contract_id: str, period: str):
    res = (
        supabase
        .table("contract_volumes")
        .select("service_code, volume")
        .eq("contract_id", contract_id)
        .eq("billing_period", period)
        .execute()
    )

    return {
        "contract_id": contract_id,
        "period": period,
        "services": res.data or []
    }
