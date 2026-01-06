from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from rag_contract.chit_chat import chat 
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

    try:
        reply = chat(
            contract_id=contract_id,
            query=payload.message
        )
        print (reply)
    except Exception as e:
        print("❌ Chat error:", str(e))
        raise HTTPException(
            status_code=500,
            detail="Failed to generate contract response"
        )

    return {
        "reply": reply
    }
