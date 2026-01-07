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
from openai import OpenAI

def normalized_table(contract_path: str):
    if not os.path.exists(contract_path):
        print(f"❌ File not found: {contract_path}")
        sys.exit(1)

    contract_id = os.path.basename(contract_path)
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
import os
import sys
import json
from groq import Groq

def normalized_table_groq(contract_id: str):
    # 🔐 SET API KEY HERE (Jupyter-safe)
    GROQ_API_KEY = ""
    os.environ["GROQ_API_KEY"] = GROQ_API_KEY

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
        ("Programs & Discounts", PROGRAMS_and_DISCOUNTS_EXTRACTION_PROMPT),
    ]

    # 🚀 Create Groq client
    client = Groq(api_key=GROQ_API_KEY)

    results = {}

    for name, base_prompt in prompts:
        print(f"\n🧠 Extracting → {name}")

        prompt_filled = base_prompt.replace("<<CONTRACT_TEXT>>", context)

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            temperature=0,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a contract pricing extraction engine.\n"
                        "Return ONLY valid JSON.\n"
                        "Do NOT include explanations, markdown, or text.\n"
                        "If data is missing, use null."
                    ),
                },
                {"role": "user", "content": prompt_filled},
            ],
        )

        raw_output = response.choices[0].message.content.strip()

        # 🛡 Remove markdown if model adds it
        if raw_output.startswith("```"):
            raw_output = raw_output.strip("`")
            raw_output = raw_output.replace("json", "", 1).strip()

        try:
            results[name] = json.loads(raw_output)
            print(f"✅ {name} extraction successful")
        except json.JSONDecodeError as e:
            print(f"\n❌ JSON parsing failed for {name}")
            print("🔴 Raw model output:")
            print(raw_output)
            raise RuntimeError(f"Invalid JSON returned for {name}") from e

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
