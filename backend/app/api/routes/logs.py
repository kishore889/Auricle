"""
System Logs routes.
"""
from fastapi import APIRouter, Depends, Query
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.api.deps import get_current_user
from app.db.models.user import User
from app.db.models.logs import SystemLogModel
from app.db.session import get_db
from app.schemas.logs import SystemLog, LogLevel, LogComponent
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/logs", tags=["System Logs"])

def _utcnow() -> str:
    return datetime.now(tz=timezone.utc).isoformat().replace("+00:00", "Z")

@router.get("", response_model=PaginatedResponse[SystemLog])
async def get_logs(
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    level: Optional[LogLevel] = None,
    component: Optional[LogComponent] = None,
    search: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> PaginatedResponse[SystemLog]:
    
    query = select(SystemLogModel)
    
    if level:
        query = query.where(SystemLogModel.level == level)
    if component:
        query = query.where(SystemLogModel.component == component)
    if search:
        query = query.where(SystemLogModel.message.ilike(f"%{search}%"))
        
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0
    
    # Paginate
    query = query.order_by(desc(SystemLogModel.timestamp))
    query = query.offset((page - 1) * pageSize).limit(pageSize)
    
    result = await db.execute(query)
    records = result.scalars().all()
    
    items = [
        SystemLog(
            id=r.id,
            timestamp=r.timestamp.isoformat().replace("+00:00", "Z") if r.timestamp else _utcnow(),
            level=r.level,
            component=r.component,
            event=r.event,
            message=r.message,
            status=r.status,
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
