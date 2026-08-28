"""
Channel simulation routes.
"""
from fastapi import APIRouter, Depends
from datetime import datetime, timezone
from app.api.deps import get_current_user
from app.db.models.user import User
from app.schemas.channels import ChannelProfile, ChannelStatus, ChannelActivation, ChannelProfileUpdateRequest
from app.state import profile_manager

router = APIRouter(prefix="/channels", tags=["Channel Simulation"])

def _utcnow() -> str:
    return datetime.now(tz=timezone.utc).isoformat().replace("+00:00", "Z")

@router.get("/profile", response_model=ChannelProfile)
async def get_channel_profile(user: User = Depends(get_current_user)) -> ChannelProfile:
    return profile_manager.get_profile()

@router.put("/profile", response_model=ChannelProfile)
async def update_channel_profile(
    update: ChannelProfileUpdateRequest,
    user: User = Depends(get_current_user)
) -> ChannelProfile:
    return profile_manager.update_profile(name=update.name, strategy=update.strategy)

@router.get("/status", response_model=ChannelStatus)
async def get_channel_status(user: User = Depends(get_current_user)) -> ChannelStatus:
    profile = profile_manager.get_profile()
    active_count = sum(1 for a in profile.activations if a.active)
    
    return ChannelStatus(
        mappingActive=True,
        strategy=profile.strategy,
        totalChannels=profile.totalChannels,
        activeChannels=active_count,
        ledVisualizationActive=True,
        lastUpdated=_utcnow(),
    )
