"""
Audio API routes.
"""
from fastapi import APIRouter, Depends, status, Response
from app.api.deps import get_current_user
from app.db.models.user import User
from app.schemas.audio import AudioStatus

router = APIRouter(prefix="/audio", tags=["Audio Processing"])

@router.get("/status", response_model=AudioStatus)
async def get_audio_status(user: User = Depends(get_current_user)) -> AudioStatus:
    return AudioStatus(
        isMonitoring=True,
        processingState="running",
        sampleRate=16000,
        signalLevel=0.42,
        signalLevelDb=-7.5,
        inputConnected=True,
        enhancementActive=True,
        latencyMs=28,
    )

@router.post("/start", status_code=status.HTTP_204_NO_CONTENT)
async def start_audio(user: User = Depends(get_current_user)):
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.post("/stop", status_code=status.HTTP_204_NO_CONTENT)
async def stop_audio(user: User = Depends(get_current_user)):
    return Response(status_code=status.HTTP_204_NO_CONTENT)
