"""
Tests for Core REST APIs (Phase B2).
"""
import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timezone

from app.main import app
from app.api.deps import get_current_user
from app.db.models.user import User

def mock_get_current_user():
    user = User(
        id="test-user-id",
        email="test@auricle.dev",
        username="testuser",
        display_name="Test User",
        role="researcher",
        is_active=True,
        created_at=datetime.now(tz=timezone.utc),
        last_login_at=datetime.now(tz=timezone.utc),
    )
    return user

@pytest.fixture
def auth_client() -> TestClient:
    app.dependency_overrides[get_current_user] = mock_get_current_user
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


# ── DEVICE ──
def test_get_device_status(auth_client):
    r = auth_client.get("/api/device/status")
    assert r.status_code == 200
    data = r.json()
    assert data["overallHealth"] in ["healthy", "offline"]
    assert "esp32Connected" in data

def test_get_device_info(auth_client):
    r = auth_client.get("/api/device")
    assert r.status_code == 200
    assert r.json()["id"] == "ESP32-AURICLE-LIVE"


# ── AUDIO ──
def test_get_audio_status(auth_client: TestClient):
    r = auth_client.get("/api/audio/status")
    assert r.status_code == 200
    assert r.json()["isMonitoring"] is True

def test_audio_start_stop(auth_client: TestClient):
    r1 = auth_client.post("/api/audio/start")
    assert r1.status_code == 204
    r2 = auth_client.post("/api/audio/stop")
    assert r2.status_code == 204


# ── SOUND ANALYSIS ──
def test_sound_current(auth_client):
    r = auth_client.get("/api/sound-analysis/current")
    assert r.status_code == 200
    data = r.json()
    assert "category" in data

def test_sound_history(auth_client):
    r = auth_client.get("/api/sound-analysis/history")
    assert r.status_code == 200
    data = r.json()
    assert "items" in data
    assert "total" in data
    assert isinstance(data["items"], list)


# ── SPEECH ──
def test_speech_current(auth_client: TestClient):
    r = auth_client.get("/api/speech/current")
    assert r.status_code == 200
    assert r.json()["speechDetected"] is True

def test_speech_history(auth_client: TestClient):
    r = auth_client.get("/api/speech/history")
    assert r.status_code == 200
    assert r.json()["total"] == 3


# ── CHANNELS ──
def test_channels_profile(auth_client):
    r = auth_client.get("/api/channels/profile")
    assert r.status_code == 200
    data = r.json()
    assert data["strategy"] == "cis_inspired"
    assert data["totalChannels"] == 22

def test_channels_profile_put(auth_client):
    r = auth_client.put(
        "/api/channels/profile", 
        json={"strategy": "legacy_map", "name": "Custom Profile"}
    )
    assert r.status_code == 200
    data = r.json()
    assert data["strategy"] == "legacy_map"
    assert data["name"] == "Custom Profile"

def test_channels_status(auth_client: TestClient):
    r = auth_client.get("/api/channels/status")
    assert r.status_code == 200
    assert r.json()["mappingActive"] is True


# ── AI INSIGHTS ──
def test_ai_status(auth_client: TestClient):
    r = auth_client.get("/api/ai/status")
    assert r.status_code == 200
    assert r.json()["state"] == "running"

def test_ai_insights(auth_client: TestClient):
    r = auth_client.get("/api/ai/insights")
    assert r.status_code == 200
    assert r.json()["total"] == 3



