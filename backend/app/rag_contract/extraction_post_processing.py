APPLICABILITY_RULES = {
    "RTGS": {"min_amount": 200000},
    "RTGS Processing Fee": {"min_amount": 200000},
    "NEFT": {"max_amount": 100000},
    "NEFT Processing Fee": {"max_amount": 100000}
}

UNIT_NORMALIZATION = {
    "Financial Guarantees": "per guarantee (1 year)",
    "Disbursement": "% of disbursed amount",
    "Credit Facility Charges - Non Interest Charges - Disbursement": "% of disbursed amount"
}

INVALID_UNITS = [None, "", "rupees", "rupee"]

NON_PRICE_KEYWORDS = [
    "invoice",
    "payment terms",
    "sla",
    "service level",
    "dispute",
    "governing law"
]


def filter_non_price_items(items):
    cleaned = []
    for item in items:
        if item.get("contract_price") is not None:
            cleaned.append(item)
    return cleaned

def normalize_units(items):
    for item in items:
        if item.get("unit") in INVALID_UNITS:
            default = UNIT_NORMALIZATION.get(item["service"])
            if default:
                item["unit"] = default
                item["unit_inferred"] = True
        else:
            item["unit_inferred"] = False
    return items


def apply_applicability(items):
    for item in items:
        if item.get("standard_service_match"):
            rule = APPLICABILITY_RULES.get(item["standard_service_name"])
            item["applicability"] = rule
        else:
            item["applicability"] = None
    return items

def enforce_standard_match_consistency(items):
    for item in items:
        if item.get("standard_service_match") and not item.get("standard_service_name"):
            item["standard_service_match"] = False
    return items

