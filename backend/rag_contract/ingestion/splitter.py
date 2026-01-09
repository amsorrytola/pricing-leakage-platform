import os
import re
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from rag_contract.rag.prompts import CLASSIFY_PRICING_PROMPT
from groq import Groq


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

def classify_chunk(text: str, model: str = "llama-3.3-70b-versatile") -> str:
    client = Groq(
        api_key=os.getenv("GROQ_API_KEY")
    )
    prompt = CLASSIFY_PRICING_PROMPT.format(text=text)

    response = client.chat.completions.create(
        model=model,
        temperature=0,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a classifier. "
                    "Return ONLY the classification label. "
                    "No explanations."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
    )

    label = response.choices[0].message.content.strip()
    return label

def classify_documents(docs, model="llama-3.3-70b-versatile"):
    classified_docs = []

    for doc in docs:
        label = classify_chunk(doc.page_content, model=model)

        # Defensive check
        if label not in {"PRICING_RELATED", "NON_PRICING"}:
            label = "NON_PRICING"

        doc.metadata["pricing_class"] = label
        classified_docs.append(doc)

    return classified_docs


