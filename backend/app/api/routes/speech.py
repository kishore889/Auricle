"""
Speech understanding routes.
"""
from fastapi import APIRouter, Depends, Query
from datetime import datetime, timezone
from app.api.deps import get_current_user
from app.db.models.user import User
from app.schemas.speech import SpeechResult
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/speech", tags=["Speech Understanding"])

def _utcnow() -> str:
    return datetime.now(tz=timezone.utc).isoformat().replace("+00:00", "Z")

@router.get("/current", response_model=SpeechResult)
async def get_current_speech(user: User = Depends(get_current_user)) -> SpeechResult:
    return SpeechResult(
        id="sp-001",
        timestamp=_utcnow(),
        speechDetected=True,
        confidence=0.88,
        transcriptionPlaceholder="[Speech detected — transcription pending backend STT]",
        processingState="running",
        durationMs=1240,
    )

@router.get("/history", response_model=PaginatedResponse[SpeechResult])
async def get_speech_history(
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user)
) -> PaginatedResponse[SpeechResult]:
    items = [
        SpeechResult(
            id=f"sp-hist-{i}",
            timestamp=_utcnow(),
            speechDetected=True,
            confidence=0.9,
            transcriptionPlaceholder="Hello, world.",
            processingState="idle",
            durationMs=2000,
        )
        for i in range(1, 4)
    ]
    return PaginatedResponse(
        items=items,
        total=3,
        page=page,
        pageSize=pageSize,
        totalPages=1
    )
