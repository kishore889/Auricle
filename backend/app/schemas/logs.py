"""
Logs schemas.
"""
from typing import Literal, Optional, Any, Dict
from pydantic import BaseModel

LogLevel = Literal['debug', 'info', 'warn', 'error', 'fatal']
from app.schemas.alerts import LogComponent

class SystemLog(BaseModel):
    id: str
    timestamp: str
    level: LogLevel
    component: LogComponent
    event: str
    message: str
    status: Literal['ok', 'warning', 'error', 'info']
    metadata: Optional[Dict[str, Any]]
