# backend/app/services/revenue_engine.py
from app.services.supabase_client import supabase
from decimal import Decimal


def run_revenue_impact_engine(volume_report_id: str):
    """
    Computes revenue impact for a submitted volume report
    """

    # 1️⃣ Fetch volume report
    report = (
        supabase
        .table("volume_reports")
        .select("contract_id, client_id, institution_id, period")
        .eq("id", volume_report_id)
        .single()
        .execute()
    )

    if not report.data:
        raise ValueError("Volume report not found")

    contract_id = report.data["contract_id"]
    period = report.data["period"]

    # 2️⃣ Fetch volume items
    items = (
        supabase
        .table("volume_report_items")
        .select("service_code, volume")
        .eq("volume_report_id", volume_report_id)
        .execute()
    ).data or []

    if not items:
        return

    # 3️⃣ Fetch latest normalized contract pricing
    pricing = (
        supabase
        .table("normalized_contracts")
        .select("extracted_terms")
        .eq("contract_id", contract_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )

    if not pricing.data:
        raise ValueError("Contract not normalized")

    terms = pricing.data[0]["extracted_terms"]

    transaction_fees = terms.get("transaction_fees", {})

    rows = []

    for item in items:
        service_code = item["service_code"]
        volume = Decimal(item["volume"])

        # 4️⃣ Contract price
        contract_price = Decimal(
            transaction_fees.get(service_code, {}).get("price", 0)
        )

        # 5️⃣ Standard price
        standard = (
            supabase
            .table("service_catalog")
            .select("standard_price")
            .eq("service_code", service_code)
            .single()
            .execute()
        )

        standard_price = Decimal(standard.data["standard_price"])

        # 6️⃣ Impact math
        price_diff = contract_price - standard_price
        revenue_impact = price_diff * volume

        classification = "GAIN" if revenue_impact > 0 else "LEAKAGE"

        rows.append({
            "contract_id": contract_id,
            "institution_id": report.data["institution_id"],
            "client_id": report.data["client_id"],
            "period": period,
            "service_code": service_code,
            "contract_price": float(contract_price),
            "standard_price": float(standard_price),
            "volume": float(volume),
            "price_diff": float(price_diff),
            "revenue_impact": float(revenue_impact),
            "classification": classification
        })

    # 7️⃣ Persist results
    supabase.table("revenue_analysis").insert(rows).execute()


def compute_revenue_impact(contract_id: str, period: str):
    """
    CORE FINANCIAL LOGIC (DO NOT DUPLICATE ANYWHERE ELSE)

    ⚠️ AI NOTE FOR AMOL:
    - This function produces GROUND TRUTH numbers.
    - LLMs should NEVER re-calculate revenue.
    - LLMs can only explain outputs of revenue_analysis table.
    """

    # 1️⃣ Fetch contract context
    # (used later for AI explanations: client, institution scope)
    contract = (
        supabase.table("contracts")
        .select("id, institution_id, client_id")
        .eq("id", contract_id)
        .single()
        .execute()
    ).data

    institution_id = contract["institution_id"]
    client_id = contract["client_id"]

    # 2️⃣ Fetch submitted volumes for the given period
    volumes = (
        supabase.table("contract_volumes")
        .select("service_code, volume")
        .eq("contract_id", contract_id)
        .eq("billing_period", period)
        .execute()
    ).data

    if not volumes:
        return

    # 3️⃣ Fetch latest normalized contract pricing
    normalized = (
        supabase.table("normalized_contracts")
        .select("extracted_terms")
        .eq("contract_id", contract_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    ).data

    if not normalized:
        return

    terms = normalized[0]["extracted_terms"]

    # ⚠️ TEMPORARY MAPPING (PHASE 2)
    # --------------------------------
    # AI NOTE:
    # This mapping will be REPLACED by:
    # - service-level extraction
    # - clause-level pricing attribution
    # - RAG-backed confidence scoring
    #
    # LLM should NOT invent prices here.
    contract_prices = {
        "ACH_TXN": terms.get("transaction_fees", {}).get("price", 2.5),
        "RTGS": terms.get("rtgs_fee", 45),
        "SWIFT": terms.get("swift_fee", 800),
    }

    # 4️⃣ Fetch standard (catalog) prices
    # AI NOTE:
    # This represents "policy / catalogue truth"
    # Useful later for "why underpriced?" explanations.
    service_catalog = (
        supabase.table("service_catalog")
        .select("service_code, standard_price")
        .execute()
    ).data

    standard_price_map = {
        s["service_code"]: s["standard_price"]
        for s in service_catalog
    }

    # 5️⃣ Idempotency: remove old analytics for same period
    # AI NOTE:
    # Prevents hallucinated deltas across re-submissions
    supabase.table("revenue_analysis") \
        .delete() \
        .eq("contract_id", contract_id) \
        .eq("period", period) \
        .execute()

    # 6️⃣ Compute revenue impact per service
    rows = []

    for v in volumes:
        service = v["service_code"]
        volume = v["volume"]

        contract_price = contract_prices.get(service)
        standard_price = standard_price_map.get(service)

        if contract_price is None or standard_price is None:
            continue

        price_diff = contract_price - standard_price
        revenue_impact = price_diff * volume

        rows.append({
            "contract_id": contract_id,
            "institution_id": institution_id,
            "client_id": client_id,
            "period": period,
            "service_code": service,
            "contract_price": contract_price,
            "standard_price": standard_price,
            "volume": volume,
            "price_diff": price_diff,
            "revenue_impact": revenue_impact,
            "impact_type": "LEAKAGE" if revenue_impact < 0 else "GAIN"
        })

    if rows:
        supabase.table("revenue_analysis").insert(rows).execute()

    # 🔮 AI EXTENSION POINT:
    # After insertion, we can trigger:
    # - insight generation
    # - anomaly detection
    # - renegotiation priority scoring

