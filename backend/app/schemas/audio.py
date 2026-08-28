"""
Audio schemas.
"""
from typing import Literal, Optional
from pydantic import BaseModel

class AudioStatus(BaseModel):
    isMonitoring: bool
    processingState: Literal['idle', 'running', 'error', 'initializing']
    sampleRate: int
    signalLevel: float
    signalLevelDb: float
    inputConnected: bool
    enhancementActive: bool
    latencyMs: Optional[int]
