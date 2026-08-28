"""
Sound Analysis and Safety Event schemas.
"""
from typing import Literal, Optional
from pydantic import BaseModel

SoundCategory = Literal['speech', 'environmental', 'warning', 'hazard', 'system']
Priority = Literal['low', 'medium', 'high', 'critical']
AlertSeverity = Literal['info', 'warning', 'error', 'critical']

class SoundDetection(BaseModel):
    id: str
    timestamp: str
    category: SoundCategory
    confidence: float
    intensity: float
    priority: Priority
    rawLabel: str
    isSafetyEvent: bool

class SafetyEvent(BaseModel):
    id: str
    timestamp: str
    category: SoundCategory
    confidence: float
    severity: AlertSeverity
    priority: Priority
    state: Literal['active', 'cleared', 'acknowledged']
    description: str
    autoCleared: bool
    clearedAt: Optional[str]
