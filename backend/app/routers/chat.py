from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str


@router.post("/{contract_id}")
def chat_with_contract(contract_id: str, payload: ChatRequest):
    print("DEBUG: Chat request received")
    print("DEBUG: Contract ID:", contract_id)
    print("DEBUG: User message:", payload.message)

    # ⚠️ Amol:
    # Replace this entire function with:
    # - ChromaDB clause retrieval
    # - Pricing policy RAG retrieval
    # - LLM grounded response generation
    # DO NOT change the API contract.

    return {
        "reply": (
            "This is a mock response.\n\n"
            "In the full system, I will answer your question "
            "using the contract clauses and pricing catalogue "
            "with full explainability."
        )
    }
