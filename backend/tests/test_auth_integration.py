"""
Full end-to-end database integration test for Authentication (Phase B1).
Uses async SQLite fixture (aiosqlite) to test DB persistence, password verification,
token issuance, session cookies, and route handlers.
"""
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.db.base import Base
from app.db.session import get_db
from app.main import app

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture
async def async_client():
    engine = create_async_engine(TEST_DB_URL, echo=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async def _override_get_db():
        async with session_factory() as session:
            yield session

    app.dependency_overrides[get_db] = _override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()
    await engine.dispose()


@pytest.mark.asyncio
async def test_full_auth_flow(async_client: AsyncClient):
    # 1. Register a new user
    reg_payload = {
        "full_name": "Dr. Alex Mercer",
        "email": "alex.mercer@auricle.dev",
        "password": "SecurePassword123!",
        "password_confirm": "SecurePassword123!",
        "institution": "Antigravity Cochlear Lab",
    }
    r_reg = await async_client.post("/api/auth/register", json=reg_payload)
    assert r_reg.status_code == 201
    user_data = r_reg.json()["user"]
    assert user_data["email"] == "alex.mercer@auricle.dev"
    assert user_data["displayName"] == "Dr. Alex Mercer"
    assert user_data["role"] == "researcher"

    # 2. Duplicate registration fails with 409
    r_dup = await async_client.post("/api/auth/register", json=reg_payload)
    assert r_dup.status_code == 409
    assert r_dup.json()["error"]["code"] == "AUTH_EMAIL_TAKEN"

    # 3. Login with wrong password fails with 401
    r_wrong = await async_client.post(
        "/api/auth/login",
        json={"email": "alex.mercer@auricle.dev", "password": "WrongPassword!"},
    )
    assert r_wrong.status_code == 401
    assert r_wrong.json()["error"]["code"] == "AUTH_INVALID_CREDENTIALS"

    # 4. Login with correct password succeeds
    r_login = await async_client.post(
        "/api/auth/login",
        json={"email": "alex.mercer@auricle.dev", "password": "SecurePassword123!"},
    )
    assert r_login.status_code == 200
    login_data = r_login.json()
    assert "accessToken" in login_data
    assert login_data["user"]["email"] == "alex.mercer@auricle.dev"
    assert "refreshToken" in async_client.cookies

    access_token = login_data["accessToken"]

    # 5. Access protected /me route
    r_me = await async_client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert r_me.status_code == 200
    assert r_me.json()["email"] == "alex.mercer@auricle.dev"

    # 6. Refresh token using cookie
    r_refresh = await async_client.post("/api/auth/refresh")
    assert r_refresh.status_code == 200
    new_access_token = r_refresh.json()["accessToken"]
    assert new_access_token != access_token

    # 7. Access /me with new access token
    r_me2 = await async_client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {new_access_token}"},
    )
    assert r_me2.status_code == 200

    # 8. Logout revokes session
    r_logout = await async_client.post("/api/auth/logout")
    assert r_logout.status_code == 204

    # 9. Refresh after logout fails
    r_refresh2 = await async_client.post("/api/auth/refresh")
    assert r_refresh2.status_code == 401
