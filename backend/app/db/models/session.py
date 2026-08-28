import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from app.db.base import Base

class SessionModel(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, default=lambda: f"session-{uuid.uuid4().hex[:12]}")
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(tz=timezone.utc), nullable=False)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    device_id = Column(String, nullable=False)
    label = Column(String, nullable=False)
    notes = Column(Text, nullable=True)
