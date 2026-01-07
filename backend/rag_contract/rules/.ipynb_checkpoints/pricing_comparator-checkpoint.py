def detect_leakage(extracted_terms, standard_pricing):
    leakage = []

    for item in extracted_terms:
        service = item["service"]
        std = standard_pricing.get(service)

        if not std:
            continue

        if item["contract_price"] is not None and item["contract_price"] < std["price"]:
            leakage.append((service, "BELOW_STANDARD_PRICE"))

        if std["minimum_fee"] and not item["minimum_fee"]:
            leakage.append((service, "MINIMUM_FEE_MISSING"))

        if std["escalation_rate"] and not item["escalation_rate"]:
            leakage.append((service, "ESCALATION_MISSING"))

    return leakage
