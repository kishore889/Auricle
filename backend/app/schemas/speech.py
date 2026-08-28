"""
Speech Result schemas.
"""
from typing import Literal, Optional
from pydantic import BaseModel

class SpeechResult(BaseModel):
    id: str
    timestamp: str
    speechDetected: bool
    confidence: float
    transcriptionPlaceholder: Optional[str]
    processingState: Literal['idle', 'running', 'error', 'initializing']
    durationMs: Optional[int]
