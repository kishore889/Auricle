"""
Device API routes.
"""
from fastapi import APIRouter, Depends
from datetime import datetime, timezone
from app.api.deps import get_current_user
from app.db.models.user import User
from app.schemas.device import DeviceStatus, Device
from app.state import hardware_manager

router = APIRouter(prefix="/device", tags=["Device Telemetry"])

def _utcnow() -> str:
    return datetime.now(tz=timezone.utc).isoformat().replace("+00:00", "Z")

@router.get("/status", response_model=DeviceStatus)
async def get_device_status(user: User = Depends(get_current_user)) -> DeviceStatus:
    return hardware_manager.get_status()

@router.get("", response_model=Device)
async def get_device_info(user: User = Depends(get_current_user)) -> Device:
    return hardware_manager.get_info()
