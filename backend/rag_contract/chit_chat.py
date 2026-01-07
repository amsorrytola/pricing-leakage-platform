from rag_contract.rag.retriever import retrieve_contract_context
import ollama


def chat_stream(contract_id: str, query: str):
    docs = retrieve_contract_context(contract_id, query)

    context = "\n\n".join(
        f"[SECTION {d.metadata.get('section_number')}]\n{d.page_content}"
        for d in docs
    )

    prompt = f"""
You are a contract analysis assistant.

Answer the question strictly using the contract context below.
If the answer is not present, say "Not found in contract".

CONTRACT CONTEXT:
{context}

QUESTION:
{query}
"""

    stream = ollama.chat(
        model="llama3.2:3b",
        messages=[{"role": "user", "content": prompt}],
        options={"temperature": 0},
        stream=True,
    )

    for chunk in stream:
        if "message" in chunk and "content" in chunk["message"]:
            yield chunk["message"]["content"]



import os
from groq import Groq

def chat(contract_id: str, query: str):
    # 🔐 SET API KEY HERE (Jupyter-safe)
    GROQ_API_KEY = ""
    os.environ["GROQ_API_KEY"] = GROQ_API_KEY

    # 🔍 Retrieve relevant chunks from Chroma
    docs = retrieve_contract_context(contract_id, query)

    if not docs:
        return "Not found in contract"

    # 📦 Build context
    context = "\n\n".join(
        f"[SECTION {d.metadata.get('section_number')}]\n{d.page_content}"
        for d in docs
    )

    prompt = f"""
You are a contract analysis assistant.

Answer the question strictly using the contract context below.
If the answer is not present, say "Not found in contract".

CONTRACT CONTEXT:
{context}

QUESTION:
{query}
"""

    # 🚀 Groq client
    client = Groq(api_key=GROQ_API_KEY)

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        temperature=0,
        messages=[
            {"role": "user", "content": prompt}
        ],
    )

    return response.choices[0].message.content.strip()