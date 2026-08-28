"""
Sessions schemas.
"""
from typing import Optional
from pydantic import BaseModel

class Session(BaseModel):
    id: str
    userId: str
    startedAt: str
    endedAt: Optional[str]
    deviceId: Optional[str]
    label: Optional[str]
    notes: Optional[str]

class SessionCreateRequest(BaseModel):
    deviceId: Optional[str] = None
    label: Optional[str] = None
    notes: Optional[str] = None
