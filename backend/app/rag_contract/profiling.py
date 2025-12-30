# ==============================
# Pricing Leakage & Severity Engine
# ==============================

from typing import Dict, Any, List


# ------------------------------
# Helper: extract price safely
# ------------------------------
def extract_price(obj):
    """
    Extract numeric price from dict or number.
    """
    if isinstance(obj, dict):
        return obj.get("price")
    if isinstance(obj, (int, float)):
        return obj
    return None


# ------------------------------
# Core logging function
# ------------------------------
def _log_price_diff(
    logs: List[Dict[str, Any]],
    category: str,
    service_name: str,
    contract_data: Dict[str, Any],
    catalog_data: Dict[str, Any]
):
    contract_price = extract_price(contract_data)
    catalog_price = extract_price(catalog_data)

    if contract_price is None or catalog_price is None:
        return

    price_diff = contract_price - catalog_price

    if price_diff < 0:
        status = "UNDER_PRICED"     # revenue leakage
    elif price_diff > 0:
        status = "OVER_PRICED"      # bank favorable
    else:
        status = "MATCHED"

    unit = None
    if isinstance(contract_data, dict):
        unit = contract_data.get("unit")
    if not unit and isinstance(catalog_data, dict):
        unit = catalog_data.get("unit")

    pricing_type = "PERCENTAGE" if unit == "percentage" else "ABSOLUTE"

    logs.append({
        "category": category,
        "service": service_name,
        "unit": unit,
        "catalog_price": catalog_price,
        "contract_price": contract_price,
        "price_diff": price_diff,
        "pricing_status": status,
        "pricing_type": pricing_type
    })


# ------------------------------
# Compare Contract vs Catalog
# ------------------------------
def compare_contract_vs_catalog(
    contract_result: Dict[str, Any],
    catalog: Dict[str, Any]
) -> List[Dict[str, Any]]:

    logs = []

    CATEGORY_MAP = {
        "Cash Management": "cash_management",
        "Domestic Payments": "domestic_payments",
        "International Payments": "international_payments",
        "Trade Finance": "trade_finance",
        "Digital Services": "digital_services"
    }

    for contract_category, contract_services in contract_result.items():

        if contract_category not in CATEGORY_MAP:
            continue

        catalog_key = CATEGORY_MAP[contract_category]
        catalog_services = catalog.get(catalog_key, {})

        for service_name, contract_data in contract_services.items():

            # ---------- Nested services ----------
            if isinstance(contract_data, dict) and "price" not in contract_data:
                for sub_service, sub_data in contract_data.items():
                    catalog_sub = catalog_services.get(service_name, {}).get(sub_service)
                    if not catalog_sub:
                        continue

                    _log_price_diff(
                        logs,
                        contract_category,
                        f"{service_name}.{sub_service}",
                        sub_data,
                        catalog_sub
                    )
                continue

            # ---------- Normal services ----------
            catalog_data = catalog_services.get(service_name)
            if not catalog_data:
                continue

            _log_price_diff(
                logs,
                contract_category,
                service_name,
                contract_data,
                catalog_data
            )

    return logs


# ------------------------------
# Severity Scoring [-1, +1]
# ------------------------------
def compute_contract_severity(pricing_logs: List[Dict[str, Any]]) -> float:

    CATEGORY_WEIGHTS = {
        "Cash Management": 1.0,
        "Domestic Payments": 1.0,
        "International Payments": 1.2,
        "Trade Finance": 1.5,
        "Digital Services": 0.8
    }

    total_weighted = 0.0
    total_weight = 0.0

    for row in pricing_logs:
        catalog_price = row["catalog_price"]
        contract_price = row["contract_price"]

        if catalog_price is None or contract_price is None:
            continue

        raw_severity = (contract_price - catalog_price) / catalog_price

        # Clamp to [-1, 1]
        severity = max(-1.0, min(1.0, raw_severity))

        weight = CATEGORY_WEIGHTS.get(row["category"], 1.0)

        total_weighted += severity * weight
        total_weight += weight

    if total_weight == 0:
        return 0.0

    return round(total_weighted / total_weight, 3)


# ------------------------------
# MAIN ENTRY
# ------------------------------
def run_pricing_analysis(contract_result: Dict[str, Any], catalog: Dict[str, Any]):

    pricing_logs = compare_contract_vs_catalog(contract_result, catalog)
    severity_score = compute_contract_severity(pricing_logs)

    return pricing_logs, severity_score


# ------------------------------
# Example Usage
# ------------------------------
if __name__ == "__main__":

    # contract_result = {...}   # your extracted pricing JSON
    # catalog = {...}           # your pricing catalog

    pricing_logs, severity = run_pricing_analysis(contract_result, catalog)

    print("\n📋 PRICING COMPARISON LOGS")
    for row in pricing_logs:
        print(row)

    print("\n📊 CONTRACT SEVERITY SCORE:", severity)
