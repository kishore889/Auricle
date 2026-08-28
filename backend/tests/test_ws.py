"""
WebSocket Endpoint Tests (Phase B3)
"""
import pytest
from fastapi.testclient import TestClient
from fastapi import status
from unittest.mock import patch, MagicMock

from app.main import app
from app.db.models.user import User

@pytest.fixture
def client() -> TestClient:
    # Use TestClient with `with` block to trigger lifespan events
    with TestClient(app) as c:
        yield c

def test_websocket_no_token(client: TestClient):
    with pytest.raises(Exception) as exc_info:
        with client.websocket_connect("/ws") as ws:
            pass
    
    # We should get a websocket 1008 close exception. 
    # FastAPI's test client raises starlette.websockets.WebSocketDisconnect
    assert exc_info.type.__name__ == "WebSocketDisconnect"
    assert exc_info.value.code == status.WS_1008_POLICY_VIOLATION


@patch("app.api.routes.ws.decode_access_token")
def test_websocket_invalid_token(mock_decode, client: TestClient):
    mock_decode.side_effect = ValueError("Invalid token")
    
    with pytest.raises(Exception) as exc_info:
        with client.websocket_connect("/ws?token=invalid_token") as ws:
            pass
            
    assert exc_info.type.__name__ == "WebSocketDisconnect"
    assert exc_info.value.code == status.WS_1008_POLICY_VIOLATION


@patch("app.api.routes.ws.decode_access_token")
@patch("app.api.routes.ws.UserRepository")
@patch("app.api.routes.ws.AsyncSessionLocal")
def test_websocket_valid_token(mock_session_maker, mock_repo, mock_decode, client: TestClient):
    # Setup mock JWT payload
    mock_decode.return_value = {"sub": "user-123"}
    
    # Setup mock user repo
    mock_user = User(id="user-123", email="test@auricle.dev", is_active=True)
    mock_repo_instance = MagicMock()
    mock_repo_instance.get_by_id.return_value = mock_user
    mock_repo.return_value = mock_repo_instance
    
    # Setup async context manager for mock_session_maker
    mock_session_context = MagicMock()
    mock_session_maker.return_value = mock_session_context
    mock_session_context.__aenter__.return_value = MagicMock()
    mock_session_context.__aexit__.return_value = None
    
    # Need to patch the repo function to be async because get_by_id is an async method
    async def mock_get_by_id(*args, **kwargs):
        return mock_user
    mock_repo_instance.get_by_id = mock_get_by_id

    # Test valid connection
    with client.websocket_connect("/ws?token=valid_token") as ws:
        # If we reach here, connection is established
        # In a real app we might receive background mock messages
        # We can just check that connection didn't raise
        pass
