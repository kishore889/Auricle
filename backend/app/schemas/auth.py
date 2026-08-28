"""
Authentication request/response Pydantic schemas.

These schemas precisely mirror the frozen frontend contract in BACKEND_CONTRACT.md.
Do NOT add password hashes or internal fields to response schemas.
"""
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


# ── User output (matches frontend `User` TypeScript interface) ────────────────

class UserOut(BaseModel):
    """Safe user profile — never contains password hashes."""
    id: str
    email: str
    username: str
    displayName: str
    role: Literal["researcher", "admin", "viewer"]
    createdAt: str        # ISO-8601 string
    lastLoginAt: Optional[str] = None

    model_config = {"from_attributes": True}


# ── Registration ──────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=256)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    password_confirm: str
    institution: Optional[str] = Field(default=None, max_length=256)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("password_confirm")
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Passwords do not match.")
        return v


class RegisterResponse(BaseModel):
    message: str = "Account created successfully."
    user: UserOut


# ── Local Login ───────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class LoginResponse(BaseModel):
    """Matches frontend LoginResponse contract exactly."""
    accessToken: str
    expiresIn: int = Field(description="Access token lifetime in seconds")
    user: UserOut


# ── Token Refresh ─────────────────────────────────────────────────────────────

class RefreshResponse(BaseModel):
    accessToken: str
    expiresIn: int


# ── Google Sign-In ────────────────────────────────────────────────────────────

class GoogleAuthRequest(BaseModel):
    """Frontend sends the Google credential (ID token) for server-side verification."""
    credential: str = Field(description="Google ID token from Google Identity Services")
