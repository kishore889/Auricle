"""
Alerts schemas.
"""
from typing import Literal, Optional, Any, Dict
from pydantic import BaseModel
from app.schemas.analysis import AlertSeverity

AlertType = Literal[
    'vehicle_horn', 'siren', 'alarm', 'high_priority_environmental',
    'microphone_failure', 'esp32_disconnected', 'hardware_communication_failure',
    'backend_failure', 'websocket_failure', 'ai_processing_failure',
    'channel_mapping_warning', 'system_info'
]

AlertStatus = Literal['active', 'acknowledged', 'resolved']
LogComponent = Literal['esp32', 'microphone', 'backend_rest', 'backend_ws', 'ai_engine', 'dsp_engine', 'frontend']

class Alert(BaseModel):
    id: str
    timestamp: str
    severity: AlertSeverity
    type: AlertType
    status: AlertStatus
    message: str
    source: LogComponent
    acknowledgedAt: Optional[str]
    resolvedAt: Optional[str]
    metadata: Optional[Dict[str, Any]]

class AlertUpdateRequest(BaseModel):
    status: Literal['acknowledged', 'resolved']
