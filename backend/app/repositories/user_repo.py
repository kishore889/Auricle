"""
User repository — all database queries related to User and UserIdentity.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models.user import User, UserIdentity


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_local_identity(self, email: str) -> Optional[UserIdentity]:
        """Fetch the local auth identity for a given email address."""
        result = await self.db.execute(
            select(UserIdentity)
            .where(UserIdentity.provider == "local", UserIdentity.provider_subject == email)
            .options(selectinload(UserIdentity.user))
        )
        return result.scalar_one_or_none()

    async def get_google_identity(self, google_sub: str) -> Optional[UserIdentity]:
        """Fetch the Google auth identity for a given Google subject identifier."""
        result = await self.db.execute(
            select(UserIdentity)
            .where(UserIdentity.provider == "google", UserIdentity.provider_subject == google_sub)
            .options(selectinload(UserIdentity.user))
        )
        return result.scalar_one_or_none()

    async def create_user_with_local_identity(
        self,
        email: str,
        full_name: str,
        password_hash: str,
        institution: Optional[str] = None,
    ) -> User:
        """Create a new User and its local UserIdentity in a single transaction."""
        user_id = str(uuid.uuid4())
        # Derive username from the local-part of the email
        base_username = email.split("@")[0][:60]
        username = await self._unique_username(base_username)

        user = User(
            id=user_id,
            email=email,
            username=username,
            display_name=full_name,
            institution=institution,
            role="researcher",
            is_active=True,
        )
        identity = UserIdentity(
            id=str(uuid.uuid4()),
            user_id=user_id,
            provider="local",
            provider_subject=email,
            provider_credential=password_hash,
        )
        self.db.add(user)
        self.db.add(identity)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def create_user_with_google_identity(
        self,
        email: str,
        full_name: str,
        google_sub: str,
    ) -> User:
        """Create a new User and its Google UserIdentity."""
        user_id = str(uuid.uuid4())
        base_username = email.split("@")[0][:60]
        username = await self._unique_username(base_username)

        user = User(
            id=user_id,
            email=email,
            username=username,
            display_name=full_name,
            role="researcher",
            is_active=True,
        )
        identity = UserIdentity(
            id=str(uuid.uuid4()),
            user_id=user_id,
            provider="google",
            provider_subject=google_sub,
            provider_credential=None,
        )
        self.db.add(user)
        self.db.add(identity)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def update_last_login(self, user_id: str) -> None:
        await self.db.execute(
            update(User)
            .where(User.id == user_id)
            .values(last_login_at=datetime.now(tz=timezone.utc))
        )
        await self.db.commit()

    # ── Internal helpers ──────────────────────────────────────────────────────

    async def _unique_username(self, base: str) -> str:
        """Ensure username is unique by appending a short suffix when needed."""
        candidate = base
        for _ in range(20):
            result = await self.db.execute(select(User).where(User.username == candidate))
            if result.scalar_one_or_none() is None:
                return candidate
            candidate = f"{base}_{uuid.uuid4().hex[:6]}"
        return f"{base}_{uuid.uuid4().hex[:8]}"
