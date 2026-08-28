"""
History schemas.
"""
from typing import Literal, Optional, Any, Dict
from pydantic import BaseModel
from app.schemas.analysis import Priority

HistoryEventType = Literal['sound_detection', 'safety_event', 'speech', 'ai_insight', 'system']
HistoryCategory = Literal['speech', 'environmental', 'warning', 'hazard', 'system']

class HistoryRecord(BaseModel):
    id: str
    timestamp: str
    eventType: HistoryEventType
    category: HistoryCategory
    confidence: Optional[float]
    priority: Optional[Priority]
    deviceId: Optional[str]
    sessionId: Optional[str]
    summary: str
    metadata: Optional[Dict[str, Any]]
