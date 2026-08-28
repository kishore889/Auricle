"""
Authentication routes for AURICLE Backend.

Endpoints (all under /api/auth):
  POST /register         — Create a local account
  POST /login            — Local email+password login
  POST /refresh          — Refresh access token via HttpOnly cookie
  POST /logout           — Revoke refresh session and clear cookie
  GET  /me               — Return current authenticated user profile
  POST /google           — Google ID-token sign-in / registration
"""
from datetime import timedelta

from fastapi import APIRouter, Cookie, Depends, Header, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import AuricleException
from app.core.security import create_access_token
from app.db.models.user import User
from app.db.session import get_db
from app.repositories.session_repo import RefreshSessionRepository
from app.repositories.user_repo import UserRepository
from app.schemas.auth import (
    GoogleAuthRequest,
    LoginRequest,
    LoginResponse,
    RefreshResponse,
    RegisterRequest,
    RegisterResponse,
    UserOut,
)
from app.services.auth_google import GoogleAuthService
from app.services.auth_local import LocalAuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])

_REFRESH_COOKIE = "refreshToken"
_REFRESH_COOKIE_MAX_AGE = settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400  # seconds


def _make_user_out(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        email=user.email,
        username=user.username,
        displayName=user.display_name,
        role=user.role,  # type: ignore[arg-type]
        createdAt=user.created_at.isoformat(),
        lastLoginAt=user.last_login_at.isoformat() if user.last_login_at else None,
    )


def _set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=_REFRESH_COOKIE,
        value=token,
        httponly=True,
        samesite="strict",
        secure=settings.APP_ENV != "development",  # Secure=False only in dev (HTTP)
        max_age=_REFRESH_COOKIE_MAX_AGE,
        path="/",
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(key=_REFRESH_COOKIE, path="/", httponly=True, samesite="strict")


# ─── POST /api/auth/register ─────────────────────────────────────────────────

@router.post(
    "/register",
    response_model=LoginResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new local account",
)
async def register(
    data: RegisterRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> LoginResponse:
    svc = LocalAuthService(db)
    user = await svc.register(data)

    # Automatically issue a session so the user is logged in right away
    session_repo = RefreshSessionRepository(db)
    refresh_token = await session_repo.create(user.id)
    _set_refresh_cookie(response, refresh_token)

    access_token = create_access_token(subject=user.id)
    return LoginResponse(
        accessToken=access_token,
        expiresIn=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=_make_user_out(user),
    )


# ─── POST /api/auth/login ─────────────────────────────────────────────────────

@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Local email + password login",
)
async def login(
    data: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> LoginResponse:
    svc = LocalAuthService(db)
    user = await svc.authenticate(data.email, data.password)

    # Update last login timestamp
    user_repo = UserRepository(db)
    await user_repo.update_last_login(user.id)

    # Refresh session (stored server-side, returned as HttpOnly cookie)
    session_repo = RefreshSessionRepository(db)
    refresh_token = await session_repo.create(user.id)
    _set_refresh_cookie(response, refresh_token)

    access_token = create_access_token(subject=user.id)
    return LoginResponse(
        accessToken=access_token,
        expiresIn=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=_make_user_out(user),
    )


# ─── POST /api/auth/refresh ───────────────────────────────────────────────────

@router.post(
    "/refresh",
    response_model=RefreshResponse,
    summary="Refresh access token using HttpOnly session cookie",
)
async def refresh(
    response: Response,
    refresh_token: str | None = Cookie(default=None, alias=_REFRESH_COOKIE),
    db: AsyncSession = Depends(get_db),
) -> RefreshResponse:
    if not refresh_token:
        raise AuricleException(
            code="AUTH_UNAUTHORIZED",
            message="Refresh session not found. Please log in again.",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    session_repo = RefreshSessionRepository(db)
    session = await session_repo.get_valid(refresh_token)
    if session is None:
        _clear_refresh_cookie(response)
        raise AuricleException(
            code="AUTH_TOKEN_EXPIRED",
            message="Refresh session has expired or been revoked.",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(session.user_id)
    if user is None or not user.is_active:
        _clear_refresh_cookie(response)
        raise AuricleException(
            code="AUTH_UNAUTHORIZED",
            message="User account is no longer valid.",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    # Rotate refresh token
    await session_repo.revoke(refresh_token)
    new_refresh_token = await session_repo.create(user.id)
    _set_refresh_cookie(response, new_refresh_token)

    access_token = create_access_token(subject=user.id)
    return RefreshResponse(
        accessToken=access_token,
        expiresIn=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


# ─── POST /api/auth/logout ────────────────────────────────────────────────────

@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Logout and revoke refresh session",
)
async def logout(
    response: Response,
    refresh_token: str | None = Cookie(default=None, alias=_REFRESH_COOKIE),
    db: AsyncSession = Depends(get_db),
) -> None:
    if refresh_token:
        session_repo = RefreshSessionRepository(db)
        await session_repo.revoke(refresh_token)
    _clear_refresh_cookie(response)


# ─── GET /api/auth/me ─────────────────────────────────────────────────────────

@router.get(
    "/me",
    response_model=UserOut,
    summary="Get authenticated user profile",
)
async def me(
    authorization: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> UserOut:
    if not authorization or not authorization.startswith("Bearer "):
        raise AuricleException(
            code="AUTH_UNAUTHORIZED",
            message="Missing or invalid Authorization header.",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )
    token = authorization[len("Bearer "):]

    from app.core.security import decode_access_token
    try:
        payload = decode_access_token(token)
    except ValueError as exc:
        raise AuricleException(
            code="AUTH_TOKEN_EXPIRED" if "expired" in str(exc).lower() else "AUTH_UNAUTHORIZED",
            message=str(exc),
            status_code=status.HTTP_401_UNAUTHORIZED,
        ) from exc

    user_id = payload.get("sub")
    if not user_id:
        raise AuricleException(
            code="AUTH_UNAUTHORIZED",
            message="Token is missing subject claim.",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if user is None or not user.is_active:
        raise AuricleException(
            code="AUTH_UNAUTHORIZED",
            message="User not found or account is inactive.",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )
    return _make_user_out(user)


# ─── POST /api/auth/google ────────────────────────────────────────────────────

@router.post(
    "/google",
    response_model=LoginResponse,
    summary="Google Sign-In — verify credential and create/return session",
)
async def google_signin(
    data: GoogleAuthRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> LoginResponse:
    svc = GoogleAuthService(db)
    user = await svc.authenticate(data.credential)

    user_repo = UserRepository(db)
    await user_repo.update_last_login(user.id)

    session_repo = RefreshSessionRepository(db)
    refresh_token = await session_repo.create(user.id)
    _set_refresh_cookie(response, refresh_token)

    access_token = create_access_token(subject=user.id)
    return LoginResponse(
        accessToken=access_token,
        expiresIn=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=_make_user_out(user),
    )
