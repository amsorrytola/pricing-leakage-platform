from fastapi import APIRouter
from app.services.supabase_client import supabase

router = APIRouter(prefix="/api/normalize", tags=["normalize"])

@router.post("/{contract_id}")
def normalize_contract(contract_id: str):
    print("DEBUG: Normalizing contract", contract_id)

    # Fetch contract metadata
    contract = (
        supabase
        .table("contracts")
        .select("id, institution_id, client_id")
        .eq("id", contract_id)
        .single()
        .execute()
    ).data

    # 🔹 MOCK normalization output
    normalized_terms = {
        "transaction_fees": {
            "wire_domestic_standard": 14.50,
            "wire_domestic_rush": 22.00,
            "wire_international_standard": 40.00
        },
        "volume_discounts": {
            "tier_3_discount_pct": 12
        },
        "minimum_monthly_revenue": 3500,
        "promotional_discounts": [
            {
                "type": "ACH",
                "discount_pct": 20,
                "valid_until": "2024-06-30"
            }
        ],
        "grandfathered_pricing": True
    }

    supabase.table("normalized_contracts").insert({
        "contract_id": contract_id,
        "institution_id": contract["institution_id"],
        "client_id": contract["client_id"],
        "extracted_terms": normalized_terms
    }).execute()

    print("DEBUG: Normalization stored")

    return {
        "status": "normalized",
        "terms": normalized_terms
    }
