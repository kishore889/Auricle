"""
Channel simulation schemas.
"""
from typing import Literal, List, Optional
from pydantic import BaseModel

ChannelStrategy = Literal['cis_inspired', 'advanced_spectral', 'legacy_map']

class ChannelActivation(BaseModel):
    channel: int
    label: str
    activation: float
    tLevel: int
    cLevel: int
    active: bool

class ChannelProfile(BaseModel):
    id: str
    name: str
    strategy: ChannelStrategy
    totalChannels: int
    activeChannels: int
    activations: List[ChannelActivation]
    lastUpdated: str
    sessionId: Optional[str]

class ChannelProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    strategy: Optional[ChannelStrategy] = None

class ChannelStatus(BaseModel):
    mappingActive: bool
    strategy: ChannelStrategy
    totalChannels: int
    activeChannels: int
    ledVisualizationActive: bool
    lastUpdated: str
