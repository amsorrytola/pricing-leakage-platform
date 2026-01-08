# backend/app/services/revenue_engine.py
from app.services.supabase_client import supabase
from decimal import Decimal
from rag_contract.profiling import run_pricing_analysis
from datetime import datetime

import os
from groq import Groq

def generate_ai_recommendations(
    enriched_logs: list,
    severity_score: float,
    leakage_count: int,
    total_impact: float,
    period: str
) -> dict:
    """
    Generate AI-powered recommendations using Groq API
    """
    try:
        # Initialize Groq client
        client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
        
        # Separate underpriced and overpriced services
        underpriced_services = []
        overpriced_services = []
        
        for log in enriched_logs:
            service_name = log.get('service', 'N/A')
            contract_price = log.get('contract_price', 0)
            catalog_price = log.get('catalog_price', 0)
            price_diff = log.get('price_diff', 0)
            status = log.get('pricing_status', 'UNKNOWN')
            
            detail = f"{service_name}: Contract ₹{contract_price} vs Catalog ₹{catalog_price} (Diff: ₹{price_diff})"
            
            if status == "UNDER_PRICED":
                underpriced_services.append(detail)
            elif status == "OVER_PRICED":
                overpriced_services.append(detail)
        
        # Build context based on what we found
        service_breakdown = ""
        
        if underpriced_services:
            service_breakdown += f"\n**⚠️ UNDERPRICED SERVICES (Revenue Leakage - {len(underpriced_services)} services):**\n"
            service_breakdown += "\n".join(f"  - {s}" for s in underpriced_services[:10])
        
        if overpriced_services:
            service_breakdown += f"\n\n**✅ OVERPRICED SERVICES (Profit Gain - {len(overpriced_services)} services):**\n"
            service_breakdown += "\n".join(f"  - {s}" for s in overpriced_services[:10])
        
        # Determine context based on severity
        if severity_score > 0:
            analysis_context = """
**POSITIVE REVENUE SITUATION**: The bank is charging ABOVE catalog prices, generating additional revenue.
This is financially BENEFICIAL for the bank. Focus recommendations on:
1. Maintaining this profitable pricing
2. Ensuring customer retention despite premium pricing
3. Identifying which services contribute most to revenue gains
4. Monitoring for any customer complaints or churn risk
"""
        else:
            analysis_context = """
**REVENUE LEAKAGE SITUATION**: The bank is charging BELOW catalog prices, losing potential revenue.
This is financially HARMFUL for the bank. Focus recommendations on:
1. Urgent repricing or renegotiation of underpriced services
2. Identifying root causes of pricing gaps
3. Calculating total revenue loss
4. Priority actions to stop revenue leakage
"""
        
        # Create prompt for Groq
        prompt = f"""You are a financial analyst working FOR THE BANK to maximize revenue.

{analysis_context}

**Period**: {period}
**Severity Score**: {severity_score:.3f} (Positive = Bank gains | Negative = Bank loses)
**Revenue Impact**: ₹{total_impact:,.0f} {'(PROFIT GAIN)' if total_impact > 0 else '(REVENUE LOSS)'}
**Underpriced Services**: {len(underpriced_services)} (causing revenue leakage)
**Overpriced Services**: {len(overpriced_services)} (generating extra profit)

{service_breakdown}

Provide 4-6 specific, actionable recommendations from the BANK'S PERSPECTIVE:
- MUST explicitly mention the underpriced service names if any exist
- MUST mention the overpriced services that are performing well
- Prioritize actions based on revenue impact
- Be specific with service names and price differences

Return ONLY a JSON array of recommendation strings. Example:
["Fix underpriced service X immediately - losing ₹Y per transaction", "Maintain premium pricing on service Z - earning ₹A extra", "Monitor service B for customer churn risk"]
"""

        # Call Groq API
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a revenue optimization analyst working for a bank. Your goal is to maximize bank profits. When prices are above catalog, that's GOOD (more revenue). When prices are below catalog, that's BAD (revenue leakage). ALWAYS mention specific service names in your recommendations. Always respond with valid JSON array format."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=600  # Increased for more detailed recommendations
        )
        
        # Parse response
        response_text = chat_completion.choices[0].message.content.strip()
        
        # Try to parse as JSON
        import json
        try:
            recommendations = json.loads(response_text)
            if not isinstance(recommendations, list):
                raise ValueError("Response not a list")
        except:
            # Fallback: split by newlines and clean
            recommendations = [
                line.strip().strip('-•').strip() 
                for line in response_text.split('\n') 
                if line.strip() and len(line.strip()) > 10
            ][:6]
        
        return {
            "next_steps": recommendations if recommendations else [
                "Review pricing analysis details",
                "Monitor services with significant price deviations",
                "Maintain profitable pricing strategy" if severity_score > 0 else "Address revenue leakage urgently"
            ]
        }
        
    except Exception as e:
        print(f"ERROR: Groq API failed - {e}")
        import traceback
        traceback.print_exc()
        
        # Enhanced fallback with service names
        underpriced_names = [log.get('service', 'unknown') for log in enriched_logs if log.get('pricing_status') == 'UNDER_PRICED']
        overpriced_names = [log.get('service', 'unknown') for log in enriched_logs if log.get('pricing_status') == 'OVER_PRICED']
        
        if underpriced_names:
            return {
                "next_steps": [
                    f"⚠️ URGENT: {len(underpriced_names)} underpriced services causing revenue loss: {', '.join(underpriced_names[:5])}",
                    "Renegotiate contracts immediately for underpriced services",
                    "Analyze contract clauses causing pricing gaps",
                    f"Maintain premium pricing on {len(overpriced_names)} profitable services" if overpriced_names else "Review all service pricing"
                ]
            }
        else:
            return {
                "next_steps": [
                    f"✅ Excellent: All {len(overpriced_names)} services earning premium revenue",
                    "Maintain current profitable pricing strategy",
                    "Monitor customer satisfaction to prevent churn while maximizing profits",
                    "Consider extending premium pricing model to additional services"
                ]
            }



# ==============================
# ADAPTERS (REUSABLE HELPERS)
# ==============================

def adapt_normalized_contract(normalized_terms: dict) -> dict:
    """Transform normalized_contracts.extracted_terms into profiling format"""
    adapted = {}
    
    if not isinstance(normalized_terms, dict):
        print(f"ERROR: normalized_terms is not a dict, got {type(normalized_terms)}")
        return {}
    
    for category, services in normalized_terms.items():
        if not isinstance(services, dict):
            print(f"WARNING: Skipping category '{category}', services is {type(services)}")
            continue
            
        adapted[category] = {}
        
        for service_code, data in services.items():
            if not isinstance(data, dict):
                print(f"WARNING: Skipping {category}.{service_code}, data is {type(data)}")
                continue
            
            # Check if this is a nested service (no 'price' key directly)
            if "price" not in data:
                # This might be nested like: standing_instruction -> setup_fee/monthly_fee
                adapted[category][service_code] = {}
                
                for sub_code, sub_data in data.items():
                    # Validate sub_data is a dict
                    if not isinstance(sub_data, dict):
                        print(f"WARNING: Skipping {category}.{service_code}.{sub_code}, sub_data is {type(sub_data)}: {sub_data}")
                        continue
                    
                    adapted[category][service_code][sub_code] = {
                        "price": sub_data.get("price"),
                        "unit": sub_data.get("unit"),
                        "source_clause": sub_data.get("source_clause")
                    }
                continue
            
            # Simple service with direct price
            adapted[category][service_code] = {
                "price": data.get("price"),
                "unit": data.get("unit"),
                "source_clause": data.get("source_clause")
            }
    
    return adapted


def adapt_catalog_rules(pricing_rules: dict) -> dict:
    """Transform pricing_catalogues.rules into profiling format"""
    adapted = {}
    
    if not isinstance(pricing_rules, dict):
        print(f"ERROR: pricing_rules is not a dict, got {type(pricing_rules)}")
        return {}
    
    categories = pricing_rules.get("pricing_categories", {})
    
    if not isinstance(categories, dict):
        print(f"ERROR: pricing_categories is not a dict, got {type(categories)}")
        return {}
    
    for category_key, services in categories.items():
        if not isinstance(services, dict):
            print(f"WARNING: Skipping category '{category_key}', services is {type(services)}")
            continue
            
        adapted[category_key] = {}
        
        for service_key, service in services.items():
            if not isinstance(service, dict):
                print(f"WARNING: Skipping {category_key}.{service_key}, not a dict")
                continue
                
            code = service.get("service_code")
            if not code:
                continue
            
            adapted[category_key][code] = {
                "price": service.get("price"),
                "unit": service.get("unit")
            }
    
    return adapted


def heatmap_bucket(diff: float) -> str:
    """Classify price difference for UI visualization"""
    if diff < -0.25:
        return "deep_red"
    if diff < 0:
        return "light_red"
    if diff == 0:
        return "neutral"
    if diff < 0.25:
        return "light_green"
    return "deep_green"


# ==============================
# OLD FUNCTION (KEEP FOR COMPATIBILITY)
# ==============================

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


# ==============================
# MAIN FUNCTION (NEW VERSION)
# ==============================

def compute_revenue_impact(contract_id: str, period: str):
    """
    CORE FINANCIAL LOGIC (DO NOT DUPLICATE ANYWHERE ELSE)
    
    ⚠️ AI NOTE FOR AMOL:
    - This function produces GROUND TRUTH numbers.
    - LLMs should NEVER re-calculate revenue.
    - LLMs can only explain outputs of revenue_analysis table.
    """
    
    # 1️⃣ Fetch contract context
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
        print(f"DEBUG: No volumes found for period {period}")
        return
    
    # Create volume lookup map
    volume_map = {v["service_code"]: v["volume"] for v in volumes}
    print(f"DEBUG: Found {len(volumes)} volume entries: {list(volume_map.keys())}")
    
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
        print("ERROR: Contract not normalized")
        return
    
    terms = normalized[0]["extracted_terms"]
    
    # 4️⃣ Fetch pricing catalogue for institution
    pricing_catalogue = (
        supabase.table("pricing_catalogues")
        .select("rules")
        .eq("institution_id", institution_id)
        .limit(1)
        .execute()
    ).data
    
    if not pricing_catalogue:
        print(f"WARNING: No pricing catalogue for institution {institution_id}")
        return
    
    catalog_rules = pricing_catalogue[0]["rules"]
    
    # Initialize variables before try block
    pricing_logs = []
    enriched_logs = []
    severity_score = 0
    leakage_severity = "warning"
    leakage_count = 0
    
    # 🔥 5️⃣ RUN YOUR ADVANCED PRICING ANALYSIS
    try:
        # Adapt data to your function's expected format
        contract_adapted = adapt_normalized_contract(terms)
        catalog_adapted = adapt_catalog_rules(catalog_rules)
        
        if not contract_adapted or not catalog_adapted:
            raise ValueError("Adaptation failed - check data structure")
        
        print(f"DEBUG: Contract categories: {list(contract_adapted.keys())}")
        print(f"DEBUG: Catalog categories: {list(catalog_adapted.keys())}")
        
        # Call your function
        pricing_logs, severity_score = run_pricing_analysis(
            contract_adapted,
            catalog_adapted
        )
        
        if not isinstance(pricing_logs, list):
            raise ValueError(f"pricing_logs should be list, got {type(pricing_logs)}")
        
        print(f"DEBUG: Pricing analysis returned {len(pricing_logs)} services, severity: {severity_score}")
        
        # Enrich logs with heatmap and source clauses
        enriched_logs = []
        leakage_count = 0
        overpriced_count = 0
        
        for row in pricing_logs:
            status = row.get("pricing_status", "UNKNOWN")
            if status == "UNDER_PRICED":
                leakage_count += 1
            elif status == "OVER_PRICED":
                overpriced_count += 1
            
            catalog_price = row.get("catalog_price", 0)
            contract_price = row.get("contract_price", 0)
            
            price_diff_pct = (
                (contract_price - catalog_price) / catalog_price
                if catalog_price > 0 else 0
            )
            
            enriched_logs.append({
                **row,
                "heatmap": heatmap_bucket(price_diff_pct),
                "source_clause": (
                    contract_adapted
                    .get(row.get("category", ""), {})
                    .get(row.get("service", ""), {})
                    .get("source_clause")
                )
            })
        
        # Determine severity label
        if severity_score < -0.15:
            leakage_severity = "critical"
        elif severity_score < 0:
            leakage_severity = "warning"
        else:
            leakage_severity = "info"
        
        print(f"DEBUG: Severity: {leakage_severity}, Leakage: {leakage_count}, Overpriced: {overpriced_count}")
        
    except Exception as e:
        print(f"ERROR in pricing analysis: {e}")
        import traceback
        traceback.print_exc()
        # Variables already initialized, just continue with empty data
    
    # Safety check
    if not pricing_logs:
        print("WARNING: Pricing analysis produced no results, skipping revenue impact calculation")
        return
    
    # 6️⃣ Idempotency: remove old analytics for same period
    supabase.table("revenue_analysis") \
        .delete() \
        .eq("contract_id", contract_id) \
        .eq("period", period) \
        .execute()
    
    # 🔥 7️⃣ BUILD PRICING MAP FROM ANALYSIS RESULTS
    # Convert pricing_logs into a lookup map by service code
    pricing_map = {}
    for log in pricing_logs:
        service_code = log.get("service", "")
        pricing_map[service_code] = {
            "contract_price": log.get("contract_price"),
            "catalog_price": log.get("catalog_price"),
            "price_diff": log.get("price_diff"),
            "status": log.get("pricing_status")
        }
    
    print(f"DEBUG: Built pricing map with {len(pricing_map)} services")
    
    # 8️⃣ Compute revenue impact by matching volumes with pricing
    # 8️⃣ Compute revenue impact by matching volumes with pricing
    rows = []
    for v in volumes:
        service = v["service_code"]
        volume = v["volume"]
        
        # Lookup from pricing analysis results
        price_info = pricing_map.get(service)
        
        if price_info is None:
            print(f"WARNING: Service '{service}' not found in pricing analysis")
            continue
        
        contract_price = price_info["contract_price"]
        catalog_price = price_info["catalog_price"]
        price_diff = price_info["price_diff"]
        
        # Calculate revenue impact
        revenue_impact = price_diff * volume
        
        # Classification based on pricing_status
        if price_info["status"] == "UNDER_PRICED":
            classification = "LEAKAGE"  # 🔥 CHANGED FROM impact_type
        elif price_info["status"] == "OVER_PRICED":
            classification = "GAIN"  # 🔥 CHANGED FROM impact_type
        else:
            classification = "NEUTRAL"  # 🔥 CHANGED FROM impact_type
        
        print(f"DEBUG: {service}: contract=₹{contract_price}, catalog=₹{catalog_price}, volume={volume}, impact=₹{revenue_impact}")
        
        rows.append({
            "contract_id": contract_id,
            "institution_id": institution_id,
            "client_id": client_id,
            "period": period,
            "service_code": service,
            "contract_price": float(contract_price),
            "standard_price": float(catalog_price),
            "volume": float(volume),
            "price_diff": float(price_diff),
            "revenue_impact": float(revenue_impact),
            "classification": classification  # 🔥 CHANGED FROM impact_type
        })

    
    if rows:
        print(f"DEBUG: Inserting {len(rows)} revenue analysis rows")
        supabase.table("revenue_analysis").insert(rows).execute()
    else:
        print("WARNING: No revenue analysis rows generated")
    
    # 9️⃣ Update contract summary with advanced metrics
    supabase.table("contracts").update({
        "leakage_pct": round(abs(severity_score) * 100, 2),
        "leakage_severity": leakage_severity,
        "last_analyzed_at": datetime.utcnow().isoformat()
    }).eq("id", contract_id).execute()
    
    # 🔟 Store detailed leakage findings (idempotent)
    supabase.table("revenue_leakage_findings") \
        .delete() \
        .eq("contract_id", contract_id) \
        .execute()
    
    supabase.table("revenue_leakage_findings").insert({
        "contract_id": contract_id,
        "institution_id": institution_id,
        "client_id": client_id,
        "severity_score": severity_score,
        "findings": enriched_logs
    }).execute()
    total_impact = sum(r["revenue_impact"] for r in rows)
    # 🔥 GENERATE AI RECOMMENDATIONS
    ai_recommendations = generate_ai_recommendations(
        enriched_logs=enriched_logs,
        severity_score=severity_score,
        leakage_count=leakage_count,
        total_impact=total_impact,
        period=period
    )

    # 1️⃣1️⃣ Enhanced AI insights
    ai_insight = {
        "contract_id": contract_id,
        "institution_id": institution_id,
        "client_id": client_id,
        "billing_period": period,
        "insight_type": "REVENUE_IMPACT_WITH_SEVERITY",
        "title": f"Revenue Impact Analysis for {period}",
        "summary": (
            f"Severity: {leakage_severity.upper()} | "
            f"Leakage services: {leakage_count} | "
            f"Score: {severity_score:.2f}"
        ),
        "recommendations": ai_recommendations,
        "supporting_data": {
            "total_leakage": sum(r["revenue_impact"] for r in rows if r["revenue_impact"] < 0),
            "total_gain": sum(r["revenue_impact"] for r in rows if r["revenue_impact"] > 0),
            "net_impact": sum(r["revenue_impact"] for r in rows),
            "severity_score": severity_score,
            "leakage_count": leakage_count
        },
        "severity": leakage_severity,
        "analysis_version": "2.0"
    }
    
    supabase.table("revenue_ai_insights").insert(ai_insight).execute()
    
    print(f"✅ Revenue impact analysis completed for {period}")



