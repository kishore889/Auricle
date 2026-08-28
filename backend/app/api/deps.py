"""
FastAPI dependencies for AURICLE Backend.
"""
from fastapi import Cookie, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AuricleException
from app.core.security import decode_access_token
from app.db.models.user import User
from app.db.session import get_db
from app.repositories.user_repo import UserRepository


def _extract_bearer_token(authorization: str | None = None) -> str:
    """Extract and return the raw JWT from 'Authorization: Bearer <token>' header."""
    # FastAPI doesn't auto-parse Authorization as a dependency parameter,
    # so we use the Header dependency pattern in the route itself.
    # This helper is used internally.
    if not authorization or not authorization.startswith("Bearer "):
        raise AuricleException(
            code="AUTH_UNAUTHORIZED",
            message="Missing or invalid Authorization header.",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )
    return authorization[len("Bearer "):]


async def get_current_user(
    authorization: str | None = None,
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    FastAPI dependency: extract and verify JWT, load the User from DB.
    Routes that require authentication declare: user: User = Depends(get_current_user)
    """
    token = _extract_bearer_token(authorization)
    try:
        payload = decode_access_token(token)
    except ValueError as exc:
        raise AuricleException(
            code="AUTH_TOKEN_EXPIRED" if "expired" in str(exc).lower() else "AUTH_UNAUTHORIZED",
            message=str(exc),
            status_code=status.HTTP_401_UNAUTHORIZED,
        ) from exc

    user_id: str | None = payload.get("sub")
    if not user_id:
        raise AuricleException(
            code="AUTH_UNAUTHORIZED",
            message="Token is missing subject claim.",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if user is None:
        raise AuricleException(
            code="AUTH_UNAUTHORIZED",
            message="Authenticated user no longer exists.",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )
    if not user.is_active:
        raise AuricleException(
            code="AUTH_ACCOUNT_INACTIVE",
            message="Account is deactivated.",
            status_code=status.HTTP_403_FORBIDDEN,
        )
    return user
