"""
Tests for Phase B6 — Safety Event Manager & Endpoints
"""
import time
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from fastapi import status

from app.main import app
from app.api.deps import get_current_user
from app.db.models.user import User
from app.services.ai.sound_classifier import ClassificationResult
from app.services.safety.event_manager import SafetyEventManager, AUTO_CLEAR_SECONDS
from app.state import safety_manager

@pytest.fixture
def manager():
    # Fresh manager for each test
    return SafetyEventManager()

@pytest.fixture
def client():
    # We will need to clear the global safety_manager for isolated route tests
    safety_manager._active.clear()
    safety_manager._history.clear()
    safety_manager._alerts.clear()
    safety_manager._new_events.clear()
    safety_manager._cleared_events.clear()
    # Override auth dependency
    async def override_get_user():
        return User(id="user-123", email="test@auricle.dev", is_active=True)
    app.dependency_overrides[get_current_user] = override_get_user

    with TestClient(app) as c:
        yield c
        
    app.dependency_overrides.clear()

# ── Mock Classifications ──────────────────────────────────────────────────────

def _hazard() -> ClassificationResult:
    return ClassificationResult(
        category="hazard", confidence=0.9, intensity=0.9,
        isSafetyEvent=True, priority="critical", rawLabel="hazard_transient"
    )

def _environmental() -> ClassificationResult:
    return ClassificationResult(
        category="environmental", confidence=0.8, intensity=0.3,
        isSafetyEvent=False, priority="low", rawLabel="environmental"
    )


# ── Unit tests: SafetyEventManager ─────────────────────────────────────────────

def test_process_hazard_raises_event(manager):
    event = manager.process(_hazard())
    assert event is not None
    assert event.category == "hazard"
    assert event.state == "active"
    assert len(manager._active) == 1
    assert len(manager._history) == 1
    
    # Check that alert was generated
    alerts, _ = manager.get_alerts()
    assert len(alerts) == 1
    assert alerts[0].alert_type == "alarm"
    assert alerts[0].status == "active"


def test_process_non_safety_ignored(manager):
    event = manager.process(_environmental())
    assert event is None
    assert len(manager._active) == 0


def test_debounce_same_category(manager):
    ev1 = manager.process(_hazard())
    assert ev1 is not None
    
    ev2 = manager.process(_hazard())
    assert ev2 is None  # Debounced
    assert len(manager._active) == 1


def test_auto_clear(manager):
    ev = manager.process(_hazard())
    assert ev is not None
    assert ev.state == "active"
    
    # Mock time.monotonic to simulate AUTO_CLEAR_SECONDS + 1 passing
    with patch("time.monotonic", return_value=time.monotonic() + AUTO_CLEAR_SECONDS + 1):
        # We need to process another event to trigger the loop's auto-clear check
        manager.process(_environmental())
        
    assert len(manager._active) == 0
    
    # History still has it, but state is cleared
    hist, _ = manager.get_history()
    assert len(hist) == 1
    assert hist[0].state == "cleared"
    assert hist[0].autoCleared is True
    
    # Alert is resolved
    alerts, _ = manager.get_alerts()
    assert alerts[0].status == "resolved"


def test_acknowledge_and_resolve(manager):
    ev = manager.process(_hazard())
    alerts, _ = manager.get_alerts()
    alt_id = alerts[0].id
    
    # Acknowledge
    manager.acknowledge(alt_id)
    alerts, _ = manager.get_alerts()
    assert alerts[0].status == "acknowledged"
    # Event should also be updated
    assert ev.state == "acknowledged"
    
    # Resolve
    manager.resolve(alt_id)
    alerts, _ = manager.get_alerts()
    assert alerts[0].status == "resolved"
    assert len(manager._active) == 0
    assert ev.state == "cleared"


def test_pop_new_events(manager):
    manager.process(_hazard())
    new_evs, cleared_evs = manager.pop_new_events()
    assert len(new_evs) == 1
    assert len(cleared_evs) == 0
    
    # Second pop should be empty
    new2, cleared2 = manager.pop_new_events()
    assert len(new2) == 0


# ── Integration tests: REST API ────────────────────────────────────────────────

def test_get_current_sound(client):
    # Default fallback
    res = client.get("/api/sound-analysis/current")
    assert res.status_code == status.HTTP_200_OK
    assert res.json()["category"] == "environmental"
    
    # Trigger an event
    safety_manager.process(_hazard())
    
    res = client.get("/api/sound-analysis/current")
    assert res.status_code == status.HTTP_200_OK
    assert res.json()["category"] == "hazard"
    assert res.json()["isSafetyEvent"] is True


def test_get_sound_history(client):
    safety_manager.process(_hazard())
    
    res = client.get("/api/sound-analysis/history")
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["total"] == 1
    assert data["items"][0]["category"] == "hazard"


def test_get_alerts(client):
    safety_manager.process(_hazard())
    
    res = client.get("/api/alerts")
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["total"] == 1
    assert data["items"][0]["type"] == "alarm"
    assert data["items"][0]["status"] == "active"


def test_patch_alert_acknowledge(client):
    safety_manager.process(_hazard())
    alerts, _ = safety_manager.get_alerts()
    alt_id = alerts[0].id
    
    res = client.patch(f"/api/alerts/{alt_id}", json={"status": "acknowledged"})
    assert res.status_code == status.HTTP_200_OK
    assert res.json()["status"] == "acknowledged"
    
    res2 = client.get("/api/alerts")
    assert res2.json()["items"][0]["status"] == "acknowledged"


def test_patch_alert_not_found(client):
    res = client.patch("/api/alerts/alt-unknown123", json={"status": "acknowledged"})
    assert res.status_code == status.HTTP_404_NOT_FOUND
