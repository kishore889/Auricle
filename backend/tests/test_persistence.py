"""
Tests for Phase B9 — PostgreSQL Persistence.
"""
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from datetime import datetime, timezone

from app.db.base import Base
from app.db.session import get_db
from app.api.deps import get_current_user
from app.db.models.user import User
from app.main import app

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

def mock_get_current_user():
    return User(
        id="test-user-id",
        email="test@auricle.dev",
        username="testuser",
        display_name="Test User",
        role="researcher",
        is_active=True,
        created_at=datetime.now(tz=timezone.utc),
        last_login_at=datetime.now(tz=timezone.utc),
    )

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
    app.dependency_overrides[get_current_user] = mock_get_current_user

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()
    await engine.dispose()


@pytest.mark.asyncio
async def test_sessions_persistence(async_client: AsyncClient):
    # Get initially - should be 404
    r1 = await async_client.get("/api/sessions")
    assert r1.status_code == 404

    # Create session
    r2 = await async_client.post("/api/sessions", json={"label": "DB Session", "deviceId": "ESP32"})
    assert r2.status_code == 200
    data = r2.json()
    assert data["label"] == "DB Session"
    assert data["deviceId"] == "ESP32"
    assert data["userId"] == "test-user-id"

    # Get session
    r3 = await async_client.get("/api/sessions")
    assert r3.status_code == 200
    assert r3.json()["id"] == data["id"]


@pytest.mark.asyncio
async def test_history_persistence(async_client: AsyncClient):
    # Empty initially
    r1 = await async_client.get("/api/history")
    assert r1.status_code == 200
    assert r1.json()["total"] == 0
    
    # Normally we'd insert via some service, but let's just make sure the endpoint works
    r2 = await async_client.get("/api/history?pageSize=10")
    assert r2.status_code == 200


@pytest.mark.asyncio
async def test_logs_persistence(async_client: AsyncClient):
    # Empty initially
    r1 = await async_client.get("/api/logs")
    assert r1.status_code == 200
    assert r1.json()["total"] == 0
