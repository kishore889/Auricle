"""
Security utilities for AURICLE Backend.
Handles JWT access-token creation/verification and Argon2 password hashing via pwdlib.

NEVER log or expose:
  - raw passwords
  - password hashes
  - JWT tokens
  - refresh tokens
"""
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from pwdlib import PasswordHash

from app.core.config import settings

# ── Password hashing (Argon2) ─────────────────────────────────────────────────
_password_hash = PasswordHash.recommended()


def hash_password(plain: str) -> str:
    """Hash a plain-text password using Argon2. Returns the encoded hash string."""
    return _password_hash.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Return True if the plain-text password matches the stored hash."""
    return _password_hash.verify(plain, hashed)


# ── JWT access tokens ─────────────────────────────────────────────────────────

def create_access_token(subject: str, additional_claims: dict[str, Any] | None = None) -> str:
    """
    Create a signed JWT access token.

    Claims:
      sub  — user ID (UUID string)
      jti  — unique token identifier
      exp  — expiration timestamp
      iat  — issued-at timestamp
    """
    now = datetime.now(tz=timezone.utc)
    expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    payload: dict[str, Any] = {
        "sub": subject,
        "jti": uuid.uuid4().hex,
        "exp": expire,
        "iat": now,
    }
    if additional_claims:
        payload.update(additional_claims)

    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    """
    Decode and validate a JWT access token.
    Raises ValueError with a safe message on any verification failure.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except ExpiredSignatureError:
        raise ValueError("Token has expired.")
    except InvalidTokenError:
        raise ValueError("Invalid token.")


# ── Refresh tokens ────────────────────────────────────────────────────────────

def generate_refresh_token() -> str:
    """Generate a cryptographically-secure opaque refresh token (64 hex chars)."""
    return secrets.token_hex(32)
