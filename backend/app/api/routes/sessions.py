"""
Sessions routes.
"""
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.api.deps import get_current_user
from app.db.models.user import User
from app.db.models.session import SessionModel
from app.db.session import get_db
from app.schemas.sessions import Session, SessionCreateRequest

router = APIRouter(prefix="/sessions", tags=["Recording Sessions"])

def _utcnow() -> str:
    return datetime.now(tz=timezone.utc).isoformat().replace("+00:00", "Z")

@router.get("", response_model=Session)
async def get_session(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Session:
    query = select(SessionModel).where(SessionModel.user_id == user.id).order_by(desc(SessionModel.started_at)).limit(1)
    result = await db.execute(query)
    record = result.scalars().first()
    
    if not record:
        raise HTTPException(status_code=404, detail="No active session found")
        
    return Session(
        id=record.id,
        userId=record.user_id,
        startedAt=record.started_at.isoformat().replace("+00:00", "Z"),
        endedAt=record.ended_at.isoformat().replace("+00:00", "Z") if record.ended_at else None,
        deviceId=record.device_id,
        label=record.label,
        notes=record.notes,
    )

@router.post("", response_model=Session)
async def create_session(
    data: SessionCreateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Session:
    new_session = SessionModel(
        user_id=user.id,
        device_id=data.deviceId or "ESP32-AURICLE-001",
        label=data.label or "New Session",
        notes=data.notes,
    )
    db.add(new_session)
    await db.commit()
    await db.refresh(new_session)
    
    return Session(
        id=new_session.id,
        userId=new_session.user_id,
        startedAt=new_session.started_at.isoformat().replace("+00:00", "Z"),
        endedAt=None,
        deviceId=new_session.device_id,
        label=new_session.label,
        notes=new_session.notes,
    )
