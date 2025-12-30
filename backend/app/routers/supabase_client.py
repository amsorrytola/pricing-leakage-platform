from app.services.supabase_client import supabase

def get_signed_contract_pdf(pdf_path: str, expires_in: int = 3600):
        response = supabase.storage.from_("contracts").create_signed_url(
            pdf_path,
            expires_in
        )
        return response["signedURL"]
