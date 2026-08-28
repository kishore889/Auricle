import pytest
from typing import Generator
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    """
    Fixture providing a FastAPI TestClient instance.
    """
    with TestClient(app) as test_client:
        yield test_client
