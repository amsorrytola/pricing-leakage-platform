from rag.prompts import CLASSIFY_PRICING_PROMPT
import warnings
warnings.filterwarnings("ignore")

import ollama
import os
import sys

from langchain_core.documents import Document
from ingestion.md_loader import load_md
from ingestion.splitter import classify_chunk, classify_documents, split_contract
from vectorstore.chroma_store import add_to_chroma

def main(contract_path: str):
    if not os.path.exists(contract_path):
        print(f"❌ File not found: {contract_path}")
        sys.exit(1)

    print(f"📄 Ingesting contract: {contract_path}")

    text = load_md(contract_path)
    docs = split_contract(text, contract_path)
    docs = classify_documents(docs)
    add_to_chroma(docs)

    print("✅ Ingestion completed and stored in Chroma")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python ingestion.py <contract_path>")
        sys.exit(1)

    contract_path = sys.argv[1]
    main(contract_path)
