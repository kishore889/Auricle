"""
Refresh session repository — database operations for refresh tokens.
"""
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import generate_refresh_token
from app.db.models.refresh_session import RefreshSession


class RefreshSessionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: str) -> str:
        """Create a new refresh session and return the token value."""
        token = generate_refresh_token()
        expires_at = datetime.now(tz=timezone.utc) + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )
        session = RefreshSession(
            id=str(uuid.uuid4()),
            user_id=user_id,
            token=token,
            expires_at=expires_at,
        )
        self.db.add(session)
        await self.db.commit()
        return token

    async def get_valid(self, token: str) -> Optional[RefreshSession]:
        """Return the refresh session if the token exists and has not expired."""
        result = await self.db.execute(
            select(RefreshSession).where(
                RefreshSession.token == token,
                RefreshSession.expires_at > datetime.now(tz=timezone.utc),
            )
        )
        return result.scalar_one_or_none()

    async def revoke(self, token: str) -> None:
        """Delete (revoke) a specific refresh session."""
        await self.db.execute(
            delete(RefreshSession).where(RefreshSession.token == token)
        )
        await self.db.commit()

    async def revoke_all_for_user(self, user_id: str) -> None:
        """Revoke all refresh sessions for a user (e.g., on password change)."""
        await self.db.execute(
            delete(RefreshSession).where(RefreshSession.user_id == user_id)
        )
        await self.db.commit()
