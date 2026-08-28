"""
Device schemas.
"""
from typing import Literal, Optional
from pydantic import BaseModel

class DeviceStatus(BaseModel):
    esp32Connected: bool = False
    esp32Id: Optional[str] = None
    esp32LastHeartbeat: Optional[str] = None
    microphoneActive: bool = False
    microphoneInputState: Literal['sampling', 'idle', 'error', 'disconnected'] = 'disconnected'
    microphoneLastUpdate: Optional[str] = None
    aiEngineState: Literal['idle', 'running', 'error', 'initializing'] = 'idle'
    dspEngineState: Literal['idle', 'running', 'error', 'initializing'] = 'idle'
    ledArrayActive: bool = False
    ledArrayChannels: int = 0
    serialCommunicationOk: bool = False
    backendRestStatus: Literal['connected', 'disconnected', 'connecting', 'error'] = 'connected'
    backendWsStatus: Literal['connected', 'disconnected', 'connecting', 'error'] = 'connected'
    overallHealth: Literal['healthy', 'degraded', 'critical', 'offline'] = 'offline'
    lastUpdated: str

class Device(BaseModel):
    id: str
    name: str
    type: str
    firmwareVersion: str
    connectedAt: str
