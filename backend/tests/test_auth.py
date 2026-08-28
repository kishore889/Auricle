"""
Authentication integration tests for AURICLE Backend Phase B1.

Uses an in-memory SQLite database so tests run without a live PostgreSQL server.
The async SQLite driver (aiosqlite) must be installed separately if needed;
alternatively these tests use TestClient (sync) which handles async internally.

For CI: no live database required.
For full integration: provide a real PostgreSQL URL via TEST_DATABASE_URL env var.
"""
import pytest
from typing import Generator
from unittest.mock import AsyncMock, MagicMock, patch

from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.db.base import Base
from app.db.session import get_db
from app.main import app

# ── In-memory SQLite for unit tests ──────────────────────────────────────────
# Note: SQLite doesn't support all PostgreSQL features (e.g., ENUM types),
# so we use a compatibility-mode Base without PostgreSQL-specific server_defaults.

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="function")
async def test_db():
    """Create an in-memory async SQLite database for each test."""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)

    # Create all tables
    async with engine.begin() as conn:
        # SQLite doesn't support CREATE TYPE, so we override ENUM columns
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with session_factory() as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.fixture
def client_no_db() -> Generator[TestClient, None, None]:
    """
    TestClient without DB overrides — tests that don't touch the database.
    """
    with TestClient(app) as c:
        yield c


# ─── Helper builders ──────────────────────────────────────────────────────────

def _register_payload(**kwargs):
    base = {
        "full_name": "Test Researcher",
        "email": "test@auricle.dev",
        "password": "SecureP@ssw0rd!",
        "password_confirm": "SecureP@ssw0rd!",
        "institution": "Auricle Lab",
    }
    base.update(kwargs)
    return base


def _login_payload(**kwargs):
    base = {"email": "test@auricle.dev", "password": "SecureP@ssw0rd!"}
    base.update(kwargs)
    return base


# ─── Security unit tests (no DB needed) ──────────────────────────────────────

class TestPasswordSecurity:
    def test_hash_and_verify(self):
        from app.core.security import hash_password, verify_password
        hashed = hash_password("mypassword")
        assert hashed != "mypassword"
        assert verify_password("mypassword", hashed)

    def test_wrong_password_rejected(self):
        from app.core.security import hash_password, verify_password
        hashed = hash_password("correct_password")
        assert not verify_password("wrong_password", hashed)


class TestJWT:
    def test_create_and_decode_token(self):
        from app.core.security import create_access_token, decode_access_token
        token = create_access_token("user-123")
        payload = decode_access_token(token)
        assert payload["sub"] == "user-123"

    def test_expired_token_raises(self):
        from datetime import datetime, timedelta, timezone
        import jwt as pyjwt
        from app.core.config import settings
        from app.core.security import decode_access_token

        payload = {
            "sub": "user-123",
            "exp": datetime.now(tz=timezone.utc) - timedelta(seconds=1),
            "iat": datetime.now(tz=timezone.utc) - timedelta(hours=1),
        }
        expired_token = pyjwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        with pytest.raises(ValueError, match="expired"):
            decode_access_token(expired_token)

    def test_invalid_token_raises(self):
        from app.core.security import decode_access_token
        with pytest.raises(ValueError, match="Invalid"):
            decode_access_token("this.is.not.a.valid.token")

    def test_tampered_token_raises(self):
        from app.core.security import create_access_token, decode_access_token
        token = create_access_token("user-123")
        tampered = token[:-4] + "AAAA"
        with pytest.raises(ValueError):
            decode_access_token(tampered)


# ─── Schema validation tests ──────────────────────────────────────────────────

class TestRegisterSchema:
    def test_passwords_must_match(self):
        from pydantic import ValidationError
        from app.schemas.auth import RegisterRequest
        with pytest.raises(ValidationError, match="Passwords do not match"):
            RegisterRequest(
                full_name="Test",
                email="a@b.com",
                password="Password1!",
                password_confirm="DifferentPass!",
            )

    def test_email_normalized(self):
        from app.schemas.auth import RegisterRequest
        req = RegisterRequest(
            full_name="Test",
            email="  UPPER@Example.COM  ",
            password="Password1!",
            password_confirm="Password1!",
        )
        assert req.email == "upper@example.com"

    def test_password_too_short(self):
        from pydantic import ValidationError
        from app.schemas.auth import RegisterRequest
        with pytest.raises(ValidationError):
            RegisterRequest(
                full_name="Test",
                email="a@b.com",
                password="short",
                password_confirm="short",
            )


# ─── Health endpoint (B0 regression) ─────────────────────────────────────────

class TestHealthRegression:
    def test_health(self, client_no_db):
        r = client_no_db.get("/health")
        assert r.status_code == 200
        assert r.json()["status"] == "healthy"

    def test_not_found(self, client_no_db):
        r = client_no_db.get("/api/this-route-does-not-exist")
        assert r.status_code == 404
        assert r.json()["error"]["code"] == "RESOURCE_NOT_FOUND"


# ─── Auth route tests (mocked DB layer) ──────────────────────────────────────
# These tests mock the DB interaction so they run without PostgreSQL.

class TestRegisterRoute:
    def test_password_mismatch_returns_422(self, client_no_db):
        payload = _register_payload(password_confirm="WRONG")
        r = client_no_db.post("/api/auth/register", json=payload)
        assert r.status_code == 422
        assert r.json()["error"]["code"] == "VALIDATION_ERROR"

    def test_short_password_returns_422(self, client_no_db):
        payload = _register_payload(password="short", password_confirm="short")
        r = client_no_db.post("/api/auth/register", json=payload)
        assert r.status_code == 422

    def test_missing_email_returns_422(self, client_no_db):
        payload = _register_payload(email="not-an-email")
        r = client_no_db.post("/api/auth/register", json=payload)
        assert r.status_code == 422


class TestLoginRoute:
    def test_missing_credentials_returns_422(self, client_no_db):
        r = client_no_db.post("/api/auth/login", json={})
        assert r.status_code == 422
        assert r.json()["error"]["code"] == "VALIDATION_ERROR"

    def test_invalid_email_format_returns_422(self, client_no_db):
        r = client_no_db.post("/api/auth/login", json={"email": "not-email", "password": "pass"})
        assert r.status_code == 422


class TestMeRoute:
    def test_no_auth_header_returns_401(self, client_no_db):
        r = client_no_db.get("/api/auth/me")
        assert r.status_code == 401
        assert r.json()["error"]["code"] == "AUTH_UNAUTHORIZED"

    def test_malformed_bearer_returns_401(self, client_no_db):
        r = client_no_db.get("/api/auth/me", headers={"Authorization": "NotBearer token"})
        assert r.status_code == 401

    def test_invalid_token_returns_401(self, client_no_db):
        r = client_no_db.get("/api/auth/me", headers={"Authorization": "Bearer invalid.jwt.token"})
        assert r.status_code == 401
        assert r.json()["error"]["code"] == "AUTH_UNAUTHORIZED"

    def test_expired_token_returns_401(self, client_no_db):
        from datetime import datetime, timedelta, timezone
        import jwt as pyjwt
        from app.core.config import settings

        expired_payload = {
            "sub": "user-123",
            "exp": datetime.now(tz=timezone.utc) - timedelta(seconds=10),
            "iat": datetime.now(tz=timezone.utc) - timedelta(hours=1),
        }
        token = pyjwt.encode(expired_payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        r = client_no_db.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 401
        assert r.json()["error"]["code"] == "AUTH_TOKEN_EXPIRED"


class TestRefreshRoute:
    def test_no_cookie_returns_401(self, client_no_db):
        r = client_no_db.post("/api/auth/refresh")
        assert r.status_code == 401
        assert r.json()["error"]["code"] == "AUTH_UNAUTHORIZED"


class TestGoogleRoute:
    def test_missing_credential_returns_422(self, client_no_db):
        r = client_no_db.post("/api/auth/google", json={})
        assert r.status_code == 422

    def test_google_not_configured_returns_503(self, client_no_db):
        """When GOOGLE_CLIENT_ID is empty the endpoint returns 503."""
        from app.core.config import settings
        original = settings.GOOGLE_CLIENT_ID
        settings.GOOGLE_CLIENT_ID = ""
        try:
            r = client_no_db.post("/api/auth/google", json={"credential": "fake-google-token"})
            assert r.status_code == 503
            assert r.json()["error"]["code"] == "AUTH_GOOGLE_NOT_CONFIGURED"
        finally:
            settings.GOOGLE_CLIENT_ID = original
