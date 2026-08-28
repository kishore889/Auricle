"""
Google OAuth authentication service.

Verifies Google ID tokens server-side using google-auth.
NEVER trusts profile information supplied directly by the frontend.

Account linking policy:
  - A Google identity is matched exclusively by the stable Google subject ID (`sub`).
  - We do NOT link to an existing local account by email match alone, as Google-verified
    email does NOT prove ownership of the pre-existing local account (different providers,
    different credential chains). This prevents account takeover via email collision.
"""
from fastapi import status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import AuricleException
from app.core.logging import logger
from app.db.models.user import User
from app.repositories.user_repo import UserRepository


class GoogleAuthService:
    def __init__(self, db: AsyncSession):
        self.repo = UserRepository(db)

    async def authenticate(self, credential: str) -> User:
        """
        Verify a Google ID token and return the linked Auricle user.
        Creates a new user+identity if this Google account has never signed in before.
        """
        id_info = self._verify_google_token(credential)

        google_sub: str = id_info["sub"]
        email: str = id_info.get("email", "").strip().lower()
        name: str = id_info.get("name") or id_info.get("email", "Google User")

        if not email:
            raise AuricleException(
                code="AUTH_GOOGLE_NO_EMAIL",
                message="Google account did not provide a verified email address.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        # Look up by the stable Google subject identifier
        identity = await self.repo.get_google_identity(google_sub)

        if identity is not None:
            user = identity.user
            if not user.is_active:
                raise AuricleException(
                    code="AUTH_ACCOUNT_INACTIVE",
                    message="This account has been deactivated.",
                    status_code=status.HTTP_403_FORBIDDEN,
                )
            return user

        # New Google user — provision an Auricle account
        logger.info(f"Provisioning new Auricle account for Google sub: {google_sub[:8]}***")
        user = await self.repo.create_user_with_google_identity(
            email=email,
            full_name=name,
            google_sub=google_sub,
        )
        return user

    def _verify_google_token(self, credential: str) -> dict:
        """
        Server-side Google ID token verification.
        Validates: cryptographic signature, issuer, audience, expiry.
        Raises AuricleException on any failure.
        """
        if not settings.GOOGLE_CLIENT_ID:
            raise AuricleException(
                code="AUTH_GOOGLE_NOT_CONFIGURED",
                message="Google authentication is not configured on this server.",
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        try:
            id_info = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )
            return id_info
        except ValueError as exc:
            logger.warning(f"Google token verification failed: {exc}")
            raise AuricleException(
                code="AUTH_GOOGLE_INVALID_TOKEN",
                message="Google authentication token is invalid or expired.",
                status_code=status.HTTP_401_UNAUTHORIZED,
            ) from exc
