from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.supabase_client import supabase
import uuid
import pdfplumber
import io


router = APIRouter(prefix="/api/contracts", tags=["contracts"])

@router.post("/upload")
async def upload_contract(
    institution_id: str = Form(...),
    client_name: str = Form(...),
    file: UploadFile = File(...)
):
    print("DEBUG: Uploading contract")
    print("DEBUG: Institution:", institution_id)
    print("DEBUG: Client:", client_name)
    print("DEBUG: File:", file.filename)

    # 1️⃣ Fetch existing client
    client_result = (
        supabase
        .table("clients")
        .select("*")
        .eq("institution_id", institution_id)
        .eq("name", client_name)
        .execute()
    )

    if client_result.data:
        client_id = client_result.data[0]["id"]
        print("DEBUG: Existing client:", client_id)
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
        print("DEBUG: New client created:", client_id)

    # 2️⃣ Read file ONCE
    file_bytes = await file.read()

    contract_id = str(uuid.uuid4())
    storage_path = f"{institution_id}/{contract_id}/{file.filename}"

    supabase.storage.from_("contracts").upload(
        storage_path,
        file_bytes,
        {"content-type": file.content_type}
    )

    # 4️⃣ Insert contract metadata
    supabase.table("contracts").insert({
        "id": contract_id,
        "institution_id": institution_id,
        "client_id": client_id,
        "name": file.filename,
        "file_path": storage_path
    }).execute()

    # 5️⃣ Extract raw text
    raw_text = ""
    if file.filename.lower().endswith(".pdf"):
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text() or ""
                raw_text += clean_text(extracted)


    supabase.table("contract_text").insert({
        "contract_id": contract_id,
        "raw_text": raw_text
    }).execute()

    print("DEBUG: Contract uploaded & text extracted")

    return {
        "contract_id": contract_id,
        "client_id": client_id,
        "status": "uploaded"
    }



@router.get("/")
def list_contracts(client_id: str):
    if not client_id or client_id == "undefined":
        raise HTTPException(status_code=400, detail="client_id is required")

    print("DEBUG: Listing contracts for client", client_id)

    result = (
        supabase
        .table("contracts")
        .select("id, name, status, created_at")
        .eq("client_id", client_id)
        .order("created_at", desc=True)
        .execute()
    )

    return result.data

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


@router.get("/by-institution")
def list_contracts_by_institution(
    institution_id: str,
    search: str | None = None,
    severity: str | None = None,
    limit: int = 20,
    cursor: str | None = None,
):
    print("DEBUG: Listing contracts (paginated)")

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


@router.get("/{contract_id}/text")
def get_contract_text(contract_id: str):
    print("DEBUG: Fetching text for contract", contract_id)

    result = (
        supabase
        .table("contract_text")
        .select("raw_text")
        .eq("contract_id", contract_id)
        .single()
        .execute()
    )

    return result.data




def clean_text(text: str) -> str:
    if not text:
        return ""
    # Remove null bytes that Postgres cannot store
    return text.replace("\x00", "")


@router.get("/{contract_id}/billable-services")
def get_billable_services(contract_id: str):
    """
    Returns the list of service_codes that are priced in this contract
    """

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


    # ⚠️ Amol:
    # Later replace this mapping with RAG-extracted service-level pricing
    services = []

    if "transaction_fees" in terms:
        services.extend([
            "ACH_TXN",
            "RTGS",
            "SWIFT"
        ])

    return {
        "contract_id": contract_id,
        "services": services
    }

