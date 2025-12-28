from fastapi import APIRouter, HTTPException
from app.schemas.volume import VolumeSubmission
from app.services.supabase_client import supabase
from app.core.service_master import SERVICE_MASTER

router = APIRouter(prefix="/api/volume", tags=["volume"])

@router.post("/submit")
def submit_volume(payload: VolumeSubmission):
    print("DEBUG: Saving volume for contract", payload.contract_id)

    # 1️⃣ Validate service codes
    for v in payload.volumes:
        if v.service_code not in SERVICE_MASTER:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown service_code: {v.service_code}"
            )
        if v.volume < 0:
            raise HTTPException(
                status_code=400,
                detail=f"Negative volume for {v.service_code}"
            )

    # 2️⃣ Fetch contract (to get client & institution)
    contract = (
        supabase
        .table("contracts")
        .select("id, client_id, institution_id")
        .eq("id", payload.contract_id)
        .single()
        .execute()
    )

    if not contract.data:
        raise HTTPException(status_code=404, detail="Contract not found")

    # 3️⃣ Upsert volumes (idempotent)
    rows = []
    for v in payload.volumes:
        rows.append({
            "contract_id": payload.contract_id,
            "client_id": contract.data["client_id"],
            "institution_id": contract.data["institution_id"],
            "billing_period": payload.billing_period,
            "service_code": v.service_code,
            "volume": v.volume
        })
    
    if not rows:
        raise HTTPException(
            status_code=400,
            detail="No volumes submitted"
    )

    supabase.table("contract_volumes").upsert(
        rows,
        on_conflict="contract_id,billing_period,service_code"
    ).execute()



    print("DEBUG: Volume saved")

    return {"status": "ok"}


# backend/app/routers/volume.py

@router.get("/by-contract")
def get_volumes(
    contract_id: str,
    billing_period: str
):
    print("DEBUG: Fetching volumes", contract_id, billing_period)

    res = (
        supabase
        .table("contract_volumes")
        .select("service_code, volume")
        .eq("contract_id", contract_id)
        .eq("billing_period", billing_period)
        .execute()
    )

    return {
        "contract_id": contract_id,
        "billing_period": billing_period,
        "volumes": res.data or []
    }


# backend/app/routers/volume.py

@router.get("/periods")
def get_billing_periods(contract_id: str):
    res = (
        supabase
        .table("contract_volumes")
        .select("billing_period")
        .eq("contract_id", contract_id)
        .order("billing_period", desc=True)
        .execute()
    )

    periods = sorted(
        {r["billing_period"] for r in (res.data or [])},
        reverse=True
    )

    return {"periods": periods}


