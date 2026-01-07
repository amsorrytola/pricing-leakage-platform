from rag_contract.vectorstore.chroma_store import get_db
from langchain_core.documents import Document


def retrieve_contract_context(contract_id: str, query: str, k: int = 6):
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


DATE_QUERIES = [
    "contract start date",
    "contract end date",
    "contract validity period",
    "agreement term",
    "effective date",
    "expiry date",
    "valid until",
    "renewal period",
    "service validity",
    "annual fee",
    "monthly fee",
]
def retrieve_temporal_contract_context(contract_id: str, k: int = 6):
    db = get_db()
    docs = []

    for q in DATE_QUERIES:
        results = db.similarity_search(
            query=q,
            k=k,
            filter={
                "$and": [
                    {"source": contract_id},
                    {"doc_type": "contract"}
                ]
            }
        )
        docs.extend(results)

    # de-duplicate by content
    seen = set()
    unique_docs = []
    for d in docs:
        if d.page_content not in seen:
            seen.add(d.page_content)
            unique_docs.append(d)

    return unique_docs

