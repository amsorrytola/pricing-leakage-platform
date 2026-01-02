from pydantic import BaseModel
from typing import Any
from datetime import datetime

class InsightCard(BaseModel):
    id: str
    contract_id: str
    institution_id: str
    client_id: str

    period: str
    insight_type: str
    title: str
    summary: str

    supporting_data: dict
    severity: str

    generated_by: str
    created_at: datetime
