# backend/app/routers/revenue_analytics.py
from fastapi import APIRouter, HTTPException
from app.services.supabase_client import supabase

router = APIRouter(
    prefix="/api/revenue",
    tags=["revenue-analytics"]
)

# -----------------------------------
# SUMMARY (Leakage / Gain / Net)
# -----------------------------------

@router.get("/summary")
def revenue_summary(contract_id: str, period: str | None = None):
    q = (
        supabase.table("revenue_analysis")
        .select("revenue_impact")
        .eq("contract_id", contract_id)
    )

    if period:
        q = q.eq("period", period)

    rows = q.execute().data or []

    leakage = sum(r["revenue_impact"] for r in rows if r["revenue_impact"] < 0)
    gain = sum(r["revenue_impact"] for r in rows if r["revenue_impact"] > 0)

    return {
        "leakage": abs(leakage),
        "gain": gain,
        "net": leakage + gain
    }


# -----------------------------------
# LEAKAGE BY SERVICE
# -----------------------------------

@router.get("/by-service")
def revenue_by_service(contract_id: str, period: str | None = None):
    q = (
        supabase.table("revenue_analysis")
        .select("service_code, revenue_impact")
        .eq("contract_id", contract_id)
    )

    if period:
        q = q.eq("period", period)

    rows = q.execute().data or []

    agg = {}
    for r in rows:
        svc = r["service_code"]
        agg[svc] = agg.get(svc, 0) + r["revenue_impact"]

    return [
        {
            "service_code": k,
            "revenue_impact": v
        }
        for k, v in agg.items()
    ]


# -----------------------------------
# TREND OVER TIME
# -----------------------------------
@router.get("/trends")
def revenue_trends(contract_id: str):
    rows = (
        supabase.table("revenue_analysis")
        .select("period, revenue_impact")
        .eq("contract_id", contract_id)
        .execute()
    ).data or []

    trend = {}
    for r in rows:
        trend[r["period"]] = trend.get(r["period"], 0) + r["revenue_impact"]

    return [
        { "period": k, "revenue_impact": v }
        for k, v in sorted(trend.items())
    ]



# -----------------------------------
# GET REVENUE AI INSIGHTS
# -----------------------------------

@router.get("/ai-insights")
def get_revenue_ai_insights(contract_id: str):
    rows = (
        supabase.table("revenue_ai_insights")
        .select("*")
        .eq("contract_id", contract_id)
        .order("generated_at", desc=True)
        .execute()
    ).data or []

    return rows
    