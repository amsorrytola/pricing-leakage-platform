import warnings
warnings.filterwarnings("ignore")

import sys
import json
import os

from ingestion.md_loader import load_md
from ingestion.splitter import split_contract
from vectorstore.chroma_store import add_to_chroma
from rag.extractor import extract_contract_pricing


def main(contract_path: str):
    if not os.path.exists(contract_path):
        print(f"❌ File not found: {contract_path}")
        sys.exit(1)

    contract_id = os.path.basename(contract_path)

    print(f"\n📄 Processing contract: {contract_id}")

    # 1️⃣ Load contract
    text = load_md(contract_path)

    # 2️⃣ Split into chunks
    docs = split_contract(text, contract_path)

    # 3️⃣ Ingest into Chroma
    add_to_chroma(docs)

    # 4️⃣ Extract pricing
    extracted,leakage_results = extract_contract_pricing(contract_id)

    # 5️⃣ Output result
    print("\n✅ Extracted Pricing:\n")
    print(json.dumps(extracted, indent=2))
    
    print("\n🚨 Pricing Abnormalities:\n")
    print(json.dumps(leakage_results, indent=2))

    return extracted, leakage_results


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python run_pipeline.py <path_to_contract_md>")
        sys.exit(1)

    contract_path = sys.argv[1]
    main(contract_path)
