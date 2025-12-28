from pydantic import BaseModel
from typing import List

class VolumeItem(BaseModel):
    service_code: str
    volume: float

class VolumeSubmission(BaseModel):
    contract_id: str
    billing_period: str
    volumes: List[VolumeItem]
