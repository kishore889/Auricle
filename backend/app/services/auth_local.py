"""
Local authentication service — registration and login logic.
"""
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AuricleException
from app.core.security import hash_password, verify_password
from app.db.models.user import User
from app.repositories.user_repo import UserRepository
from app.schemas.auth import RegisterRequest


class LocalAuthService:
    def __init__(self, db: AsyncSession):
        self.repo = UserRepository(db)

    async def register(self, data: RegisterRequest) -> User:
        """
        Create a new local account.
        Rejects duplicate emails with a standardized error.
        """
        existing = await self.repo.get_by_email(data.email)
        if existing is not None:
            raise AuricleException(
                code="AUTH_EMAIL_TAKEN",
                message="An account with this email address already exists.",
                status_code=status.HTTP_409_CONFLICT,
            )

        password_hash = hash_password(data.password)
        user = await self.repo.create_user_with_local_identity(
            email=data.email,
            full_name=data.full_name,
            password_hash=password_hash,
            institution=data.institution,
        )
        return user

    async def authenticate(self, email: str, password: str) -> User:
        """
        Verify credentials and return the User.
        Uses generic credential errors to prevent account enumeration.
        """
        identity = await self.repo.get_local_identity(email)

        # Use a constant-time generic error for both "not found" and "wrong password"
        _generic_error = AuricleException(
            code="AUTH_INVALID_CREDENTIALS",
            message="Invalid email or password.",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

        if identity is None or identity.provider_credential is None:
            raise _generic_error

        if not verify_password(password, identity.provider_credential):
            raise _generic_error

        user = identity.user
        if not user.is_active:
            raise AuricleException(
                code="AUTH_ACCOUNT_INACTIVE",
                message="This account has been deactivated.",
                status_code=status.HTTP_403_FORBIDDEN,
            )

        return user
