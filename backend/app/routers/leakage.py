from fastapi import APIRouter, HTTPException
from app.services.supabase_client import supabase
from datetime import datetime
from rag_contract.profiling import run_pricing_analysis

router = APIRouter(prefix="/api/leakage", tags=["leakage"])

# ==============================
# ADAPTERS (MINIMAL & SAFE)
# ==============================

def adapt_normalized_contract(normalized_terms: dict) -> dict:
    adapted = {}

    for category, services in normalized_terms.items():
        adapted[category] = {}

        for service_code, data in services.items():

            # Nested services
            if isinstance(data, dict) and "price" not in data:
                adapted[category][service_code] = {}
                for sub_code, sub_data in data.items():
                    adapted[category][service_code][sub_code] = {
                        "price": sub_data.get("price"),
                        "unit": sub_data.get("unit"),
                        "source_clause": sub_data.get("source_clause")
                    }
                continue

            adapted[category][service_code] = {
                "price": data.get("price"),
                "unit": data.get("unit"),
                "source_clause": data.get("source_clause")
            }

    return adapted

def adapt_catalog_rules(pricing_rules: dict) -> dict:
    adapted = {}
    categories = pricing_rules.get("pricing_categories", {})

    for category_key, services in categories.items():
        adapted[category_key] = {}

        for service in services.values():
            code = service.get("service_code")
            if not code:
                continue

            adapted[category_key][code] = {
                "price": service.get("price"),
                "unit": service.get("unit")
            }

    return adapted

# ==============================
# HEATMAP SCORING (UI READY)
# ==============================

def heatmap_bucket(diff: float) -> str:
    if diff < -0.25:
        return "deep_red"
    if diff < 0:
        return "light_red"
    if diff == 0:
        return "neutral"
    if diff < 0.25:
        return "light_green"
    return "deep_green"


# def adapt_catalog_rules(pricing_rules: dict) -> dict:
#     adapted = {}
#     categories = pricing_rules.get("pricing_categories", {})

#     for category_key, services in categories.items():
#         adapted[category_key] = {}

#         for service in services.values():
#             code = service.get("service_code")
#             if not code:
#                 continue

#             adapted[category_key][code] = {
#                 "price": service.get("price"),
#                 "unit": service.get("unit")
#             }

#     return adapted



# ==============================
# MAIN ENDPOINT



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
    # 3️⃣ Adapt data (KEY STEP)
    contract_result = adapt_normalized_contract(
        normalized["extracted_terms"]
    )

    catalog = adapt_catalog_rules(
        pricing["rules"]
    )

    # 4️⃣ Run pricing engine
    pricing_logs, severity_score = run_pricing_analysis(
        contract_result,
        catalog
    )

    # 5️⃣ Enrich logs (clauses + heatmap)
    enriched_logs = []
    leakage_count = 0

    for row in pricing_logs:
        price_diff = row["price_diff"]
        status = row["pricing_status"]

        if status == "UNDER_PRICED":
            leakage_count += 1

        enriched_logs.append({
            **row,
            "heatmap": heatmap_bucket(
                (row["contract_price"] - row["catalog_price"]) / row["catalog_price"]
            ),
            "source_clause": (
                contract_result
                .get(row["category"], {})
                .get(row["service"], {})
                .get("source_clause")
            )
        })

    # 6️⃣ Contract-level severity
    if severity_score < -0.15:
        leakage_severity = "critical"
    elif severity_score < 0:
        leakage_severity = "warning"
    else:
        leakage_severity = "healthy"
    terms = normalized["extracted_terms"]
    rules = pricing["rules"]

    # 7️⃣ Persist summary
    supabase.table("contracts").update({
        "leakage_pct": round(abs(severity_score) * 100, 2),
        "leakage_severity": leakage_severity,
        "last_analyzed_at": datetime.utcnow().isoformat()
    }).eq("id", contract_id).execute()

    # 8️⃣ Idempotent write
    supabase.table("revenue_leakage_findings") \
        .delete() \
        .eq("contract_id", contract_id) \
        .execute()

    supabase.table("revenue_leakage_findings").insert({
        "contract_id": contract_id,
        "institution_id": normalized["institution_id"],
        "client_id": normalized["client_id"],
        "severity_score": severity_score,
        "findings": enriched_logs
    }).execute()

    # 9️⃣ UI-READY RESPONSE
    return {
        "status": "completed",
        "severity_score": severity_score,
        "severity_label": leakage_severity,
        "leakage_count": leakage_count,
        "findings": enriched_logs
    }

#     print("DEBUG: Normalized terms:", terms)
#     print("DEBUG: Pricing rules:", rules)

#     # --------------------------------------------------
#     # 3️⃣ Rule-based leakage detection (DETERMINISTIC)
#     # --------------------------------------------------
#     findings = []
#     leakage_categories = {
#         "discounts": False,
#         "promotions": False,
#         "minimum_revenue": False,
#     }

#     # 🔎 RULE 1 — Excessive discount
#     max_allowed_discount = (
#         rules.get("transaction_fee", {})
#         .get("max_discount_pct")
#     )

#     actual_discount = (
#         terms.get("volume_discounts", {})
#         .get("tier_3_discount_pct", 0)
#     )

#     if max_allowed_discount is not None and actual_discount > max_allowed_discount:
#         leakage_categories["discounts"] = True
#         findings.append({
#             "type": "EXCESSIVE_DISCOUNT",
#             "severity": "high",
#             "message": (
#                 f"Discount {actual_discount}% exceeds allowed "
#                 f"maximum {max_allowed_discount}%"
#             )
#         })

#     # 🔎 RULE 2 — Expired promotion
#     for promo in terms.get("promotional_discounts", []):
#         if promo.get("valid_until") and promo["valid_until"] < "2024-07-01":
#             leakage_categories["promotions"] = True
#             findings.append({
#                 "type": "EXPIRED_PROMOTION",
#                 "severity": "high",
#                 "message": "Promotional discount has expired but appears active"
#             })

#     # 🔎 RULE 3 — MMRG shortfall
#     standard_mmrg = rules.get("minimum_monthly_revenue")
#     actual_mmrg = terms.get("minimum_monthly_revenue", 0)

#     if standard_mmrg and actual_mmrg < standard_mmrg:
#         leakage_categories["minimum_revenue"] = True
#         findings.append({
#             "type": "MMRG_SHORTFALL",
#             "severity": "medium",
#             "message": (
#                 "Minimum monthly revenue guarantee is below "
#                 "standard pricing catalogue"
#             )
#         })

#     # --------------------------------------------------
#     # ⚠️ AI EXPLANATION PLACEHOLDER (FOR AMOL)
#     # --------------------------------------------------
#     # TODO (Amol):
#     # Replace this explanation block with:
#     # - RAG over contract clauses
#     # - Pricing policy explanations
#     # - LLM-generated natural language reasoning
#     for f in findings:
#         f["explanation"] = (
#             "This finding was generated using rule-based analysis. "
#             "Future versions will include LLM-based explanations "
#             "grounded in contract clauses and pricing policy."
#         )

#     # --------------------------------------------------
#     # 4️⃣ Compute leakage summary (MOCK SCORING)
#     # --------------------------------------------------
#     # TODO (Amol):
#     # Replace this scoring logic with AI-assisted scoring later
#     if not findings:
#         leakage_pct = 0.0
#         leakage_severity = "healthy"
#     elif len(findings) == 1:
#         leakage_pct = 8.0
#         leakage_severity = "warning"
#     else:
#         leakage_pct = 18.0
#         leakage_severity = "critical"

#     print("DEBUG: Leakage pct:", leakage_pct)
#     print("DEBUG: Leakage severity:", leakage_severity)

#     # --------------------------------------------------
#     # 5️⃣ Persist leakage summary on CONTRACT
#     # --------------------------------------------------
#     supabase.table("contracts").update({
#         "leakage_pct": leakage_pct,
#         "leakage_severity": leakage_severity,
#         "leakage_categories": leakage_categories,
#         "last_analyzed_at": datetime.utcnow().isoformat()
#     }).eq("id", contract_id).execute()

#     # --------------------------------------------------
#     # 6️⃣ Idempotency — delete old findings
#     # --------------------------------------------------
#     print("DEBUG: Removing previous findings (if any)")
#     supabase.table("revenue_leakage_findings") \
#         .delete() \
#         .eq("contract_id", contract_id) \
#         .execute()

#     # --------------------------------------------------
#     # 7️⃣ Store new findings
#     # --------------------------------------------------
#     print("DEBUG: Storing new findings")
#     supabase.table("revenue_leakage_findings").insert({
#         "contract_id": contract_id,
#         "institution_id": normalized["institution_id"],
#         "client_id": normalized["client_id"],
#         "findings": findings
#     }).execute()

#     print("DEBUG: Leakage detection completed")

#     # --------------------------------------------------
#     # 8️⃣ API response
#     # --------------------------------------------------
#     return {
#         "status": "completed",
#         "leakage_pct": leakage_pct,
#         "leakage_severity": leakage_severity,
#         "categories": leakage_categories,
#         "findings": findings
#     }


# @router.get("/{contract_id}")
# def get_leakage_result(contract_id: str):
#     findings_res = (
#         supabase
#         .table("revenue_leakage_findings")
#         .select("findings, created_at")
#         .eq("contract_id", contract_id)
#         .order("created_at", desc=True)
#         .limit(1)
#         .execute()
#     )

#     contract_res = (
#         supabase
#         .table("contracts")
#         .select("leakage_pct, leakage_severity, leakage_categories, last_analyzed_at")
#         .eq("id", contract_id)
#         .single()
#         .execute()
#     )

#     if not findings_res.data:
#         return {"analyzed": False}

#     return {
#         "analyzed": True,
#         "summary": contract_res.data,
#         "findings": findings_res.data[0]["findings"]
#     }
