"""
Sound analysis routes — upgraded in Phase B6 to serve live safety event data.
"""
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, Query

from app.api.deps import get_current_user
from app.db.models.user import User
from app.schemas.analysis import SoundDetection, SoundCategory, Priority
from app.schemas.common import PaginatedResponse
from app.state import safety_manager

router = APIRouter(prefix="/sound-analysis", tags=["Sound Analysis"])


def _utcnow() -> str:
    return datetime.now(tz=timezone.utc).isoformat().replace("+00:00", "Z")


@router.get("/current", response_model=SoundDetection)
async def get_current_sound(user: User = Depends(get_current_user)) -> SoundDetection:
    latest = safety_manager.get_latest_detection()
    if latest:
        return SoundDetection(
            id=latest.id,
            timestamp=latest.timestamp,
            category=latest.category,
            confidence=latest.confidence,
            intensity=0.65,          # intensity stored on ClassificationResult, not SafetyEvent
            priority=latest.priority,
            rawLabel=latest.category,
            isSafetyEvent=True,
        )
    # Fallback — no events raised yet
    return SoundDetection(
        id="det-init-001",
        timestamp=_utcnow(),
        category="environmental",
        confidence=0.60,
        intensity=0.20,
        priority="low",
        rawLabel="environmental",
        isSafetyEvent=False,
    )


@router.get("/history", response_model=PaginatedResponse[SoundDetection])
async def get_sound_history(
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    category: Optional[SoundCategory] = None,
    priority: Optional[Priority] = None,
    user: User = Depends(get_current_user),
) -> PaginatedResponse[SoundDetection]:
    events, total = safety_manager.get_history(page=page, page_size=pageSize)

    items = [
        SoundDetection(
            id=e.id,
            timestamp=e.timestamp,
            category=e.category,
            confidence=e.confidence,
            intensity=0.65,
            priority=e.priority,
            rawLabel=e.category,
            isSafetyEvent=True,
        )
        for e in events
        if (category is None or e.category == category)
        and (priority is None or e.priority == priority)
    ]

    import math
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        pageSize=pageSize,
        totalPages=max(1, math.ceil(total / pageSize)),
    )
