from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.supabase_client import supabase
import uuid
import pdfplumber
import io


router = APIRouter(prefix="/api/contracts", tags=["contracts"])


# ============================================================================
# UPLOAD CONTRACT PDF
# ============================================================================
@router.post("/upload")
async def upload_contract(
    institution_id: str = Form(...),
    client_name: str = Form(...),
    file: UploadFile = File(...)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # Fetch or create client
    client_result = (
        supabase
        .table("clients")
        .select("id")
        .eq("institution_id", institution_id)
        .eq("name", client_name)
        .execute()
    )

    if client_result.data:
        client_id = client_result.data[0]["id"]
    else:
        new_client = (
            supabase
            .table("clients")
            .insert({
                "institution_id": institution_id,
                "name": client_name
            })
            .execute()
        )
        client_id = new_client.data[0]["id"]

    file_bytes = await file.read()
    contract_id = str(uuid.uuid4())
    storage_path = f"{institution_id}/{contract_id}/{file.filename}"

    # Upload to Supabase Storage
    supabase.storage.from_("contracts").upload(
        storage_path,
        file_bytes,
        file_options={
            "content-type": file.content_type,
            "upsert": "true"
        }
    )

    # Insert contract metadata
    supabase.table("contracts").insert({
        "id": contract_id,
        "institution_id": institution_id,
        "client_id": client_id,
        "name": file.filename,
        "file_path": storage_path,
        "status": "uploaded"
    }).execute()

    # Extract raw text
    raw_text = ""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            raw_text += clean_text(page.extract_text() or "")

    supabase.table("contract_text").insert({
        "contract_id": contract_id,
        "raw_text": raw_text
    }).execute()

    return {
        "contract_id": contract_id,
        "client_id": client_id,
        "status": "uploaded"
    }


# ============================================================================
# LIST CONTRACTS (BY CLIENT)
# ============================================================================
@router.get("/")
def list_contracts(client_id: str):
    if not client_id:
        raise HTTPException(400, "client_id is required")

    result = (
        supabase
        .table("contracts")
        .select("id, name, status, created_at")
        .eq("client_id", client_id)
        .order("created_at", desc=True)
        .execute()
    )

    return result.data


# ============================================================================
# LIST CONTRACTS BY CLIENT (PAGINATED)
# ============================================================================
@router.get("/by-client")
def list_contracts_by_client(
    client_id: str,
    search: str | None = None,
    severity: str | None = None,
    limit: int = 20,
    cursor: str | None = None,
):
    query = (
        supabase
        .table("contracts")
        .select(
            "id, name, leakage_pct, leakage_severity",
            count="exact"
        )
        .eq("client_id", client_id)
        .order("id")
        .limit(limit)
    )

    if cursor:
        query = query.gt("id", cursor)

    if search:
        query = query.ilike("name", f"%{search}%")

    if severity:
        query = query.eq("leakage_severity", severity)

    res = query.execute()
    data = res.data or []
    next_cursor = data[-1]["id"] if len(data) == limit else None

    return {
        "data": data,
        "next_cursor": next_cursor,
        "total": res.count
    }


# ============================================================================
# LIST CONTRACTS BY INSTITUTION (PAGINATED)
# ============================================================================
@router.get("/by-institution")
def list_contracts_by_institution(
    institution_id: str,
    search: str | None = None,
    severity: str | None = None,
    limit: int = 20,
    cursor: str | None = None,
):
    query = (
        supabase
        .table("contracts")
        .select(
            "id, name, status, leakage_pct, leakage_severity",
            count="exact"
        )
        .eq("institution_id", institution_id)
        .order("id")
        .limit(limit)
    )

    if cursor:
        query = query.gt("id", cursor)

    if search:
        query = query.ilike("name", f"%{search}%")

    if severity:
        query = query.eq("leakage_severity", severity)

    res = query.execute()
    data = res.data or []
    next_cursor = data[-1]["id"] if len(data) == limit else None

    return {
        "data": data,
        "next_cursor": next_cursor,
        "total": res.count
    }


# ============================================================================
# CONTRACT SUB-ROUTES (SAFE ORDER)
# ============================================================================
@router.get("/{contract_id}/text")
def get_contract_text(contract_id: str):
    result = (
        supabase
        .table("contract_text")
        .select("raw_text")
        .eq("contract_id", contract_id)
        .single()
        .execute()
    )
    return result.data


@router.get("/{contract_id}/pdf-url")
def get_contract_pdf_url(contract_id: str):
    contract = (
        supabase
        .table("contracts")
        .select("file_path")
        .eq("id", contract_id)
        .single()
        .execute()
    )

    if not contract.data:
        raise HTTPException(404, "Contract not found")

    signed = supabase.storage.from_("contracts").create_signed_url(
        contract.data["file_path"],
        60 * 60
    )

    return {"url": signed["signedURL"]}


@router.get("/{contract_id}/billable-services")
def get_billable_services(contract_id: str):
    pricing = (
        supabase
        .table("normalized_contracts")
        .select("extracted_terms")
        .eq("contract_id", contract_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )

    if not pricing.data:
        raise HTTPException(404, "Contract not normalized")

    terms = pricing.data[0]["extracted_terms"]

    services = []
    if "transaction_fees" in terms:
        services.extend(["ACH_TXN", "RTGS", "SWIFT"])

    return {
        "contract_id": contract_id,
        "services": services
    }


# ============================================================================
# ⚠️ CATCH-ALL ROUTE (MUST BE LAST)
# ============================================================================
@router.get("/{contract_id}")
def get_contract(contract_id: str):
    result = (
        supabase
        .table("contracts")
        .select("id, name, client_id, institution_id, file_path, created_at")
        .eq("id", contract_id)
        .single()
        .execute()
    )

    if not result.data:
        raise HTTPException(404, "Contract not found")

    return result.data


# ============================================================================
# UTIL
# ============================================================================
def clean_text(text: str) -> str:
    return text.replace("\x00", "") if text else ""
