from fastapi import APIRouter, HTTPException
from app.services.supabase_client import supabase
from datetime import datetime

router = APIRouter(prefix="/api/leakage", tags=["leakage"])


@router.post("/{contract_id}")
def detect_revenue_leakage(contract_id: str):
    print("DEBUG: Running revenue leakage detection for", contract_id)

    # --------------------------------------------------
    # 1️⃣ Fetch normalized contract (SAFE)
    # --------------------------------------------------
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

    # --------------------------------------------------
    # 2️⃣ Fetch active pricing catalogue (SAFE)
    # --------------------------------------------------
    pricing_res = (
        supabase
        .table("pricing_catalogues")
        .select("*")
        .eq("institution_id", normalized["institution_id"])
        .limit(1)
        .execute()
    )

    print("DEBUG: Fetched pricing catalogue", pricing_res.data)

    if not pricing_res.data:
        raise HTTPException(
            status_code=404,
            detail="Active pricing catalogue not found"
        )

    pricing = pricing_res.data[0]

    terms = normalized["extracted_terms"]
    rules = pricing["rules"]

    print("DEBUG: Normalized terms:", terms)
    print("DEBUG: Pricing rules:", rules)

    # --------------------------------------------------
    # 3️⃣ Rule-based leakage detection (DETERMINISTIC)
    # --------------------------------------------------
    findings = []
    leakage_categories = {
        "discounts": False,
        "promotions": False,
        "minimum_revenue": False,
    }

    # 🔎 RULE 1 — Excessive discount
    max_allowed_discount = (
        rules.get("transaction_fee", {})
        .get("max_discount_pct")
    )

    actual_discount = (
        terms.get("volume_discounts", {})
        .get("tier_3_discount_pct", 0)
    )

    if max_allowed_discount is not None and actual_discount > max_allowed_discount:
        leakage_categories["discounts"] = True
        findings.append({
            "type": "EXCESSIVE_DISCOUNT",
            "severity": "high",
            "message": (
                f"Discount {actual_discount}% exceeds allowed "
                f"maximum {max_allowed_discount}%"
            )
        })

    # 🔎 RULE 2 — Expired promotion
    for promo in terms.get("promotional_discounts", []):
        if promo.get("valid_until") and promo["valid_until"] < "2024-07-01":
            leakage_categories["promotions"] = True
            findings.append({
                "type": "EXPIRED_PROMOTION",
                "severity": "high",
                "message": "Promotional discount has expired but appears active"
            })

    # 🔎 RULE 3 — MMRG shortfall
    standard_mmrg = rules.get("minimum_monthly_revenue")
    actual_mmrg = terms.get("minimum_monthly_revenue", 0)

    if standard_mmrg and actual_mmrg < standard_mmrg:
        leakage_categories["minimum_revenue"] = True
        findings.append({
            "type": "MMRG_SHORTFALL",
            "severity": "medium",
            "message": (
                "Minimum monthly revenue guarantee is below "
                "standard pricing catalogue"
            )
        })

    # --------------------------------------------------
    # ⚠️ AI EXPLANATION PLACEHOLDER (FOR AMOL)
    # --------------------------------------------------
    # TODO (Amol):
    # Replace this explanation block with:
    # - RAG over contract clauses
    # - Pricing policy explanations
    # - LLM-generated natural language reasoning
    for f in findings:
        f["explanation"] = (
            "This finding was generated using rule-based analysis. "
            "Future versions will include LLM-based explanations "
            "grounded in contract clauses and pricing policy."
        )

    # --------------------------------------------------
    # 4️⃣ Compute leakage summary (MOCK SCORING)
    # --------------------------------------------------
    # TODO (Amol):
    # Replace this scoring logic with AI-assisted scoring later
    if not findings:
        leakage_pct = 0.0
        leakage_severity = "healthy"
    elif len(findings) == 1:
        leakage_pct = 8.0
        leakage_severity = "warning"
    else:
        leakage_pct = 18.0
        leakage_severity = "critical"

    print("DEBUG: Leakage pct:", leakage_pct)
    print("DEBUG: Leakage severity:", leakage_severity)

    # --------------------------------------------------
    # 5️⃣ Persist leakage summary on CONTRACT
    # --------------------------------------------------
    supabase.table("contracts").update({
        "leakage_pct": leakage_pct,
        "leakage_severity": leakage_severity,
        "leakage_categories": leakage_categories,
        "last_analyzed_at": datetime.utcnow().isoformat()
    }).eq("id", contract_id).execute()

    # --------------------------------------------------
    # 6️⃣ Idempotency — delete old findings
    # --------------------------------------------------
    print("DEBUG: Removing previous findings (if any)")
    supabase.table("revenue_leakage_findings") \
        .delete() \
        .eq("contract_id", contract_id) \
        .execute()

    # --------------------------------------------------
    # 7️⃣ Store new findings
    # --------------------------------------------------
    print("DEBUG: Storing new findings")
    supabase.table("revenue_leakage_findings").insert({
        "contract_id": contract_id,
        "institution_id": normalized["institution_id"],
        "client_id": normalized["client_id"],
        "findings": findings
    }).execute()

    print("DEBUG: Leakage detection completed")

    # --------------------------------------------------
    # 8️⃣ API response
    # --------------------------------------------------
    return {
        "status": "completed",
        "leakage_pct": leakage_pct,
        "leakage_severity": leakage_severity,
        "categories": leakage_categories,
        "findings": findings
    }


@router.get("/{contract_id}")
def get_leakage_result(contract_id: str):
    findings_res = (
        supabase
        .table("revenue_leakage_findings")
        .select("findings, created_at")
        .eq("contract_id", contract_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )

    contract_res = (
        supabase
        .table("contracts")
        .select("leakage_pct, leakage_severity, leakage_categories, last_analyzed_at")
        .eq("id", contract_id)
        .single()
        .execute()
    )

    if not findings_res.data:
        return {"analyzed": False}

    return {
        "analyzed": True,
        "summary": contract_res.data,
        "findings": findings_res.data[0]["findings"]
    }
