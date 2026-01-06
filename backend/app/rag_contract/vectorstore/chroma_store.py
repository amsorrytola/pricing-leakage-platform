from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OllamaEmbeddings

CHROMA_PATH = "chroma"

def get_db():
    return Chroma(
        persist_directory=CHROMA_PATH,
        embedding_function=OllamaEmbeddings(model="nomic-embed-text")
    )

def add_to_chroma(docs):
    db = get_db()

    if not docs:
        return

    source = docs[0].metadata.get("source")

    # 🔥 Remove existing chunks for this contract
    if source:
        db._collection.delete(
            where={"source": source}
        )

    # Add fresh chunks
    db.add_documents(docs)
    db.persist()
