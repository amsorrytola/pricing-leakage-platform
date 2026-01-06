import json
import re

def safe_json_load(raw: str):
    """
    Safely extract and parse JSON from LLM output.
    Handles markdown fences, extra text, and partial outputs.
    """

    if not raw or not raw.strip():
        raise ValueError("LLM returned empty output")

    raw = raw.strip()

    # Remove markdown fences
    raw = re.sub(r"^```json", "", raw, flags=re.IGNORECASE).strip()
    raw = re.sub(r"^```", "", raw).strip()
    raw = re.sub(r"```$", "", raw).strip()

    # Try direct JSON parse
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass

    # Fallback: extract JSON array
    match = re.search(r"\[\s*{.*}\s*\]", raw, flags=re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    raise ValueError("LLM output is not valid JSON")


def compare_with_standard(extracted_items, standard_catalog):
    abnormalities = []

    for item in extracted_items:
        standard_name = item.get("standard_service_name")

        # Skip extras / non-standard services
        if standard_name is None:
            continue

        std = standard_catalog.get(standard_name)

        # Skip if standard service not found in catalog
        if not std:
            continue

        contract_price = item.get("contract_price")
        standard_price = std.get("price")

        # Skip if price missing
        if contract_price is None or standard_price is None:
            continue

        # Compare prices (ONLY abnormalities)
        if contract_price < standard_price:
            leakage_status = "BELOW_STANDARD_PRICE"
        elif contract_price > standard_price:
            leakage_status = "ABOVE_STANDARD_PRICE"
        else:
            # Matches standard → ignore
            continue

        item.update({
            "standard_price": standard_price,
            "standard_unit": std.get("unit"),
            "standard_currency": std.get("currency"),
            "standard_escalation_rate": std.get("escalation_rate"),
            "price_delta": contract_price - standard_price,
            "leakage_status": leakage_status
        })

        abnormalities.append(item)

    return abnormalities

