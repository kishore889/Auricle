"""
Audit Event History routes.
"""
from fastapi import APIRouter, Depends, Query, HTTPException
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.api.deps import get_current_user
from app.db.models.user import User
from app.db.models.history import HistoryModel
from app.db.session import get_db
from app.schemas.history import HistoryRecord, HistoryEventType, HistoryCategory
from app.schemas.analysis import Priority
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/history", tags=["Audit Event History"])

def _utcnow() -> str:
    return datetime.now(tz=timezone.utc).isoformat().replace("+00:00", "Z")

@router.get("", response_model=PaginatedResponse[HistoryRecord])
async def get_history(
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    eventType: Optional[HistoryEventType] = None,
    category: Optional[HistoryCategory] = None,
    priority: Optional[Priority] = None,
    search: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> PaginatedResponse[HistoryRecord]:
    
    query = select(HistoryModel)
    
    if eventType:
        query = query.where(HistoryModel.event_type == eventType)
    if category:
        query = query.where(HistoryModel.category == category)
    if priority:
        query = query.where(HistoryModel.priority == priority)
    if search:
        query = query.where(HistoryModel.summary.ilike(f"%{search}%"))
        
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0
    
    # Paginate
    query = query.order_by(desc(HistoryModel.timestamp))
    query = query.offset((page - 1) * pageSize).limit(pageSize)
    
    result = await db.execute(query)
    records = result.scalars().all()
    
    items = [
        HistoryRecord(
            id=r.id,
            timestamp=r.timestamp.isoformat().replace("+00:00", "Z") if r.timestamp else _utcnow(),
            eventType=r.event_type,
            category=r.category,
            confidence=r.confidence,
            priority=r.priority,
            deviceId=r.device_id,
            sessionId=r.session_id,
            summary=r.summary,
            metadata=r.metadata_payload,
        )
        for r in records
    ]
    
    total_pages = (total + pageSize - 1) // pageSize
    
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        pageSize=pageSize,
        totalPages=total_pages
    )
