import warnings
warnings.filterwarnings("ignore")

import os
import sys
import json
import ollama

from rag_contract.rag.prompts import (
    CASH_MANAGEMENT_SERVICES_EXTRACTION_PROMPT,
    DOMESTIC_PAYMENTS_EXTRACTION_PROMPT,
    INTERNATIONAL_PAYMENTS_EXTRACTION_PROMPT,
    TRADE_FINANCE_EXTRACTION_PROMPT,
    DIGITAL_SERVICESEXTRACTION_PROMPT,
    CREDIT_FACILITIES_EXTRACTION_PROMPT,
    PROGRAMS_and_DISCOUNTS_EXTRACTION_PROMPT
)

from rag_contract.rag.retriever import get_pricing_chunks


def normalized_table(contract_id: str):
    
    print(f"\n📄 Processing contract: {contract_id}")

    # 🔍 Retrieve only PRICING_RELATED chunks from Chroma
    print("🔍 Retrieving pricing-related chunks...")
    docs = get_pricing_chunks(contract_id)
    print(f"✅ Retrieved {len(docs)} pricing chunks")

    # 📦 Build context
    context = "\n\n".join(
        f"[SECTION {d.metadata.get('section_number')}]\n{d.page_content}"
        for d in docs
    )

    prompts = [
        ("Cash Management", CASH_MANAGEMENT_SERVICES_EXTRACTION_PROMPT),
        ("Domestic Payments", DOMESTIC_PAYMENTS_EXTRACTION_PROMPT),
        ("International Payments", INTERNATIONAL_PAYMENTS_EXTRACTION_PROMPT),
        ("Trade Finance", TRADE_FINANCE_EXTRACTION_PROMPT),
        ("Digital Services", DIGITAL_SERVICESEXTRACTION_PROMPT),
        ("Credit Facilities", CREDIT_FACILITIES_EXTRACTION_PROMPT),
        ("Programs & Discounts", PROGRAMS_and_DISCOUNTS_EXTRACTION_PROMPT)
    ]

    results = {}

    for name, base_prompt in prompts:
        print(f"\n🧠 Extracting → {name}")

        prompt_filled = base_prompt.replace("<<CONTRACT_TEXT>>", context)

        response = ollama.chat(
            model="llama3.1:8b",
            messages=[{"role": "user", "content": prompt_filled}],
            options={"temperature": 0},
            stream=False,
        )

        raw_output = response["message"]["content"].strip()

        try:
            data = json.loads(raw_output)
            results[name] = data
            print(f"✅ {name} extraction successful")
        except json.JSONDecodeError:
            print(f"❌ JSON parsing failed for {name}")
            print("🔴 Raw model output:")
            print(raw_output)
            raise

    print("\n🎉 All pricing extractions completed successfully")
    return results


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python extract_pricing.py <contract_path>")
        sys.exit(1)

    contract_path = sys.argv[1]
    extracted = main(contract_path)

    # 🧾 Optional: pretty print final output
    print("\n📊 FINAL EXTRACTED PRICING JSON")
    print(json.dumps(extracted, indent=2))
