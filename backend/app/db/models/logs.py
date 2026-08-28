import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, JSON
from app.db.base import Base

class SystemLogModel(Base):
    __tablename__ = "system_logs"

    id = Column(String, primary_key=True, default=lambda: f"log-{uuid.uuid4().hex[:12]}")
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(tz=timezone.utc), nullable=False)
    level = Column(String, nullable=False)
    component = Column(String, nullable=False)
    event = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String, nullable=False)
    metadata_payload = Column(JSON, nullable=True)
