"""
AI Insights routes.
"""
from fastapi import APIRouter, Depends, Query
from datetime import datetime, timezone
from app.api.deps import get_current_user
from app.db.models.user import User
from app.schemas.ai import AIInsight, AIStatus
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/ai", tags=["AI Insights"])

def _utcnow() -> str:
    return datetime.now(tz=timezone.utc).isoformat().replace("+00:00", "Z")

@router.get("/status", response_model=AIStatus)
async def get_ai_status(user: User = Depends(get_current_user)) -> AIStatus:
    return AIStatus(
        state="running",
        modelLoaded=True,
        modelVersion="v1.2",
        lastInferenceMs=42,
    )

@router.get("/insights", response_model=PaginatedResponse[AIInsight])
async def get_ai_insights(
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user)
) -> PaginatedResponse[AIInsight]:
    items = [
        AIInsight(
            id=f"insight-{i}",
            timestamp=_utcnow(),
            eventType="Conversation",
            environmentalContext="Office",
            confidence=0.95,
            priority="medium",
            soundCategory="speech",
            speechActivity=True,
            engineState="running",
            summary="A conversational setting with low background noise.",
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
