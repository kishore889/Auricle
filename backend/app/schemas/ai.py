"""
AI Insights schemas.
"""
from typing import Literal, Optional
from pydantic import BaseModel

from app.schemas.analysis import Priority, SoundCategory

class AIInsight(BaseModel):
    id: str
    timestamp: str
    eventType: str
    environmentalContext: str
    confidence: float
    priority: Priority
    soundCategory: Optional[SoundCategory]
    speechActivity: bool
    engineState: Literal['idle', 'running', 'error', 'initializing']
    summary: str

class AIStatus(BaseModel):
    state: Literal['idle', 'running', 'error', 'initializing']
    modelLoaded: bool
    modelVersion: str
    lastInferenceMs: int
