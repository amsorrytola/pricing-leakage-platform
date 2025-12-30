from rag_contract.vectorstore.chroma_store import get_db
from langchain_core.documents import Document


def retrieve_contract_context(contract_id: str, query: str, k: int = 12):
    db = get_db()

    return db.similarity_search(
        query=query,
        k=k,
        filter={
            "$and": [
                {"source": contract_id},
                {"doc_type": "contract"}
            ]
        }
    )
def get_pricing_chunks(contract_id: str):
    db = get_db()

    results = db._collection.get(
        where={
            "$and": [
                {"source": contract_id},
                {"pricing_class": "PRICING_RELATED"}
            ]
        },
        include=["documents", "metadatas"]
    )

    if not results or not results.get("documents"):
        return []

    return [
        Document(page_content=doc, metadata=meta)
        for doc, meta in zip(results["documents"], results["metadatas"])
    ]