from fastapi.testclient import TestClient


def test_root_endpoint(client: TestClient):
    """Test GET / returns service metadata."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "AURICLE Backend"
    assert data["status"] == "healthy"
    assert data["version"] == "1.0.0"


def test_health_endpoint_direct(client: TestClient):
    """Test GET /health returns 200 OK and healthy status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "auricle-backend"
    assert data["environment"] == "development"
    assert data["version"] == "1.0.0"


def test_health_endpoint_api_prefix(client: TestClient):
    """Test GET /api/health returns 200 OK and healthy status."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_invalid_route_behavior(client: TestClient):
    """Test GET /non-existent-route returns standardized 404 error response."""
    response = client.get("/non-existent-route")
    assert response.status_code == 404
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "RESOURCE_NOT_FOUND"
