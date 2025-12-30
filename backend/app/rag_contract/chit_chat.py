from rag_contract.rag.retriever import retrieve_contract_context
import ollama


def chat_with_ai(contract_id: str, query: str):
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

    response = ollama.chat(
        model="llama3.1:8b",
        messages=[{"role": "user", "content": prompt}],
        options={"temperature": 0},
        stream=False,
    )

    return response["message"]["content"]
