# backend/app/routers/leakage.py
from fastapi import APIRouter, HTTPException
from app.services.supabase_client import supabase

router = APIRouter(prefix="/api/leakage", tags=["leakage"])

@router.post("/{contract_id}")
def detect_revenue_leakage(contract_id: str):
    print("DEBUG: Running revenue leakage detection for", contract_id)

    # 1️⃣ Fetch normalized contract (SAFE)
    normalized_res = (
        supabase
        .table("normalized_contracts")
        .select("*")
        .eq("contract_id", contract_id)
        .execute()
    )

    if not normalized_res.data:
        raise HTTPException(status_code=404, detail="Contract not normalized")

    normalized = normalized_res.data[0]

    # 2️⃣ Fetch active pricing catalogue (SAFE)
    pricing_res = (
        supabase
        .table("pricing_catalogues")
        .select("*")
        .eq("institution_id", normalized["institution_id"])
        .eq("status", "active")
        .execute()
    )

    if not pricing_res.data:
        raise HTTPException(status_code=404, detail="Active pricing catalogue not found")

    pricing = pricing_res.data[0]

    terms = normalized["extracted_terms"]
    rules = pricing["rules"]

    findings = []

    print("DEBUG: Normalized terms:", terms)
    print("DEBUG: Pricing rules:", rules)

    # 🔎 RULE 1 — Excessive discount
    max_allowed_discount = (
        rules
        .get("transaction_fee", {})
        .get("max_discount_pct")
    )
    
    if max_allowed_discount is not None:
        actual_discount = terms.get("volume_discounts", {}).get("tier_3_discount_pct", 0)

        if actual_discount > max_allowed_discount:
            findings.append({
                "type": "EXCESSIVE_DISCOUNT",
                "severity": "high",
                "message": f"Discount {actual_discount}% exceeds allowed maximum {max_allowed_discount}%"
            })
    else:
        print("WARN: max_discount_pct not defined in pricing rules")


    # 🔎 RULE 2 — Expired promotion
    for promo in terms.get("promotional_discounts", []):
        if promo["valid_until"] < "2024-07-01":
            findings.append({
                "type": "EXPIRED_PROMOTION",
                "severity": "high",
                "message": "Promotional discount has expired but appears active"
            })

    # 🔎 RULE 3 — MMRG shortfall
    if terms.get("minimum_monthly_revenue", 0) < rules["minimum_monthly_revenue"]:
        findings.append({
            "type": "MMRG_SHORTFALL",
            "severity": "medium",
            "message": "Minimum monthly revenue guarantee is below standard"
        })

    # ⚠️ Amol:
    # Replace this block with LLM + RAG explanation logic later
    for f in findings:
        f["explanation"] = (
            "This finding was generated using rule-based analysis. "
            "In future, an LLM will explain this using contract clauses "
            "and pricing policy context."
        )

    # 3️⃣ DELETE old findings (idempotency)
    print("DEBUG: Removing previous findings (if any)")
    supabase.table("revenue_leakage_findings") \
        .delete() \
        .eq("contract_id", contract_id) \
        .execute()

    # 4️⃣ INSERT new findings
    print("DEBUG: Storing new findings")
    supabase.table("revenue_leakage_findings").insert({
        "contract_id": contract_id,
        "institution_id": normalized["institution_id"],
        "client_id": normalized["client_id"],
        "findings": findings
    }).execute()

    print("DEBUG: Leakage detection completed")

    return {
        "status": "completed",
        "findings": findings
    }
