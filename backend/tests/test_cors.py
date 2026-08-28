from fastapi.testclient import TestClient


def test_cors_preflight_valid_origin(client: TestClient):
    """Test CORS preflight request with allowed frontend origin."""
    origin = "http://localhost:5173"
    headers = {
        "Origin": origin,
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "Authorization, Content-Type",
    }
    response = client.options("/health", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == origin
    assert response.headers.get("access-control-allow-credentials") == "true"


def test_cors_request_valid_origin(client: TestClient):
    """Test standard GET request with Origin header."""
    origin = "http://localhost:5173"
    headers = {"Origin": origin}
    response = client.get("/health", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == origin
