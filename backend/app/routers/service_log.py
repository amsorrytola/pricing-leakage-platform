from datetime import datetime, date
import os
def parse_date_flexible(date_str: str) -> date:
    """
    Supports:
    - 2025-02-03
    - February 3, 2025
    """
    if not date_str:
        return None

    for fmt in ("%Y-%m-%d", "%B %d, %Y"):
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            pass

    raise ValueError(f"Unsupported date format: {date_str}")
from fastapi import APIRouter, HTTPException
from datetime import date, datetime
from app.services.supabase_client import supabase

import json
from groq import Groq
from rag_contract.rag.retriever import retrieve_temporal_contract_context
from rag_contract.rag.prompts import service_log_prompt

router = APIRouter(prefix="/api/contracts", tags=["service-log"])


# ============================================================================
# STATUS LOGIC
# ============================================================================
def compute_status(days_left: int):
    if days_left > 30:
        return "ACTIVE"
    if days_left > 0:
        return "EXPIRING"
    return "EXPIRED"


# ============================================================================
# GROQ EXTRACTION (DATES + SERVICES)
# ============================================================================
def extract_dates_and_services(contract_id: str):
    client = Groq(
        api_key=os.getenv("GROQ_API_KEY")
    )

    docs = retrieve_temporal_contract_context(contract_id)

    if not docs:
        raise RuntimeError("No temporal contract chunks found")

    context = "\n\n".join(
        f"[SECTION {d.metadata.get('section_number')}]\n{d.page_content}"
        for d in docs
    )

    prompt = service_log_prompt.replace("<<CONTRACT_TEXT>>", context)

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        temperature=0,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = response.choices[0].message.content.strip()

    # Remove markdown fences
    if raw.startswith("```"):
        raw = raw.replace("```json", "").replace("```", "").strip()

    if not raw or not raw.startswith("{"):
        raise RuntimeError(f"Invalid Groq response:\n{raw}")

    return json.loads(raw)


# ============================================================================
# NORMALIZE → STORE SERVICE LOG
# ============================================================================
@router.post("/{contract_id}/service-log")
def generate_service_log(contract_id: str):
    print("DEBUG: Generating service log for", contract_id)

    extracted = extract_dates_and_services(contract_id)

    contract_start = parse_date_flexible(
        extracted["contract"]["contract_start_date"]
    )
    contract_end = parse_date_flexible(
        extracted["contract"]["contract_end_date"]
    )

    today = date.today()

    supabase.table("service_log").delete().eq(
        "contract_id", contract_id
    ).execute()

    rows = []

    for s in extracted["services"]:
        expiry_date = (
            parse_date_flexible(s["explicit_end_date"])
            if s["explicit_end_date"]
            else contract_end
        )

        days_left = (expiry_date - today).days
        status = compute_status(days_left)

        rows.append({
            "contract_id": contract_id,
            "service_code": s["service_code"],
            "service_name": s["service_name"],
            "expiry_date": expiry_date.isoformat(),
            "days_left": days_left,
            "status": status,
        })

    if rows:
        supabase.table("service_log").insert(rows).execute()

    return {
        "status": "success",
        "services_inserted": len(rows)
    }


# ============================================================================
# GET SERVICE LOG (FRONTEND API)
# ============================================================================
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
            "summary": {"active": 0, "expiring": 0, "expired": 0},
            "services": []
        }

    summary = {"ACTIVE": 0, "EXPIRING": 0, "EXPIRED": 0}

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
