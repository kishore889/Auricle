import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, Text, JSON
from app.db.base import Base

class HistoryModel(Base):
    __tablename__ = "history"

    id = Column(String, primary_key=True, default=lambda: f"hist-{uuid.uuid4().hex[:12]}")
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(tz=timezone.utc), nullable=False)
    event_type = Column(String, nullable=False)
    category = Column(String, nullable=False)
    confidence = Column(Float, nullable=True)
    priority = Column(String, nullable=True)
    device_id = Column(String, nullable=True)
    session_id = Column(String, nullable=True)
    summary = Column(Text, nullable=False)
    metadata_payload = Column(JSON, nullable=True)
