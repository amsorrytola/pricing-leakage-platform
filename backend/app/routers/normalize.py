from fastapi import APIRouter, HTTPException
from app.services.supabase_client import supabase

from pypdf import PdfReader
import io

# RAG pipeline imports
from rag_contract.ingestion.splitter import split_contract
from rag_contract.ingestion.splitter import classify_documents
from rag_contract.vectorstore.chroma_store import add_to_chroma
from rag_contract.normalized_table import normalized_table

router = APIRouter(prefix="/api/normalize", tags=["normalize"])


# ============================================================================
# UTILITY: Extract text from PDF using PyPDF
# ============================================================================
def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(pdf_bytes))
    text = ""

    for page in reader.pages:
        extracted = page.extract_text() or ""
        text += extracted + "\n"

    return text


# ============================================================================
# NORMALIZE CONTRACT + INGEST INTO CHROMA
# ============================================================================
@router.post("/{contract_id}")
def normalize_contract(contract_id: str):
    print("DEBUG: Normalizing contract", contract_id)

    # ------------------------------------------------------------------------
    # 1️⃣ Fetch contract metadata
    # ------------------------------------------------------------------------
    contract = (
        supabase
        .table("contracts")
        .select("id, institution_id, client_id, file_path")
        .eq("id", contract_id)
        .single()
        .execute()
    ).data

    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    # ------------------------------------------------------------------------
    # 2️⃣ Generate signed PDF URL (for frontend)
    # ------------------------------------------------------------------------
    pdf_url = None
    if contract.get("file_path"):
        pdf_url = supabase.storage.from_("contracts").create_signed_url(
            contract["file_path"],
            60 * 60  # 1 hour
        )["signedURL"]

    # ------------------------------------------------------------------------
    # 3️⃣ DOWNLOAD PDF + EXTRACT TEXT (PyPDF)
    # ------------------------------------------------------------------------
    print("DEBUG: Downloading PDF from Supabase")

    pdf_bytes = supabase.storage.from_("contracts").download(
        contract["file_path"]
    )

    text = extract_text_from_pdf(pdf_bytes)

    if not text.strip():
        raise HTTPException(
            status_code=422,
            detail="PDF text extraction failed (possibly scanned PDF)"
        )

    # ------------------------------------------------------------------------
    # 4️⃣ SPLIT → CLASSIFY → STORE IN CHROMA (RAG INGESTION)
    # ------------------------------------------------------------------------
    print("DEBUG: Running RAG ingestion")

    docs = split_contract(
        text=text,
        source_path=contract_id
    )

    docs = classify_documents(docs)

    add_to_chroma(
        docs
    )

    print("✅ Ingestion completed and stored in Chroma")

    # ------------------------------------------------------------------------
    # 5️⃣ MOCK NORMALIZATION OUTPUT (placeholder)
    # ------------------------------------------------------------------------
    normalized_terms = normalized_table(contract_id)

    # ------------------------------------------------------------------------
    # 6️⃣ STORE NORMALIZED OUTPUT
    # ------------------------------------------------------------------------
    supabase.table("normalized_contracts").insert({
        "contract_id": contract_id,
        "institution_id": contract["institution_id"],
        "client_id": contract["client_id"],
        "extracted_terms": normalized_terms
    }).execute()

    print("DEBUG: Normalization stored")

    return {
        "status": "normalized",
        "terms": normalized_terms,
        "contract_pdf_url": pdf_url
    }


# ============================================================================
# GET LATEST NORMALIZED CONTRACT
# ============================================================================
@router.get("/{contract_id}")
def get_normalized_contract(contract_id: str):
    result = (
        supabase
        .table("normalized_contracts")
        .select("extracted_terms, created_at")
        .eq("contract_id", contract_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )

    if not result.data:
        return {"normalized": False}

    return {
        "normalized": True,
        "terms": result.data[0]["extracted_terms"]
    }
