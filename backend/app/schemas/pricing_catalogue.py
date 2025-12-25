# backend/app/schemas/pricing_catalogue.py
from pydantic import BaseModel
from typing import Dict, Any

class PricingCatalogueCreate(BaseModel):
    institution_id: str
    name: str
    rules: Dict[str, Any]
