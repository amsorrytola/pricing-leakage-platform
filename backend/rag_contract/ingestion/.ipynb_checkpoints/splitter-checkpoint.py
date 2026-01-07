import os
import re
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from rag.prompts import CLASSIFY_PRICING_PROMPT
import ollama


def split_contract(text: str, source_path: str):
    contract_id = os.path.basename(source_path)

    raw_sections = re.split(r"(?=\n?\d+\.\s)", text)
    docs = []

    for sec in raw_sections:
        sec = sec.strip()

        # 🚫 drop junk chunks
        if len(sec) < 40:
            continue

        m = re.match(r"(\d+)\.", sec)
        section_num = int(m.group(1)) if m else None

        if section_num == 0:
            section_num = None

        docs.append(
            Document(
                page_content=sec,
                metadata={
                    "source": contract_id,
                    "doc_type": "contract",
                    "section_number": section_num,
                    "pricing_class": None
                }
            )
        )

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1200,
        chunk_overlap=150
    )

    return splitter.split_documents(docs)
def classify_chunk(text: str, model: str = "llama3.1:8b") -> str:
    prompt = CLASSIFY_PRICING_PROMPT.format(text=text)

    response = ollama.chat(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        options={"temperature": 0}
    )

    label = response["message"]["content"].strip()
    return label
def classify_documents(docs, model="llama3.1:8b"):
    classified_docs = []

    for doc in docs:
        label = classify_chunk(doc.page_content, model=model)

        # Defensive check
        if label not in {"PRICING_RELATED", "NON_PRICING"}:
            label = "NON_PRICING"

        doc.metadata["pricing_class"] = label
        classified_docs.append(doc)

    return classified_docs


