from fastapi import APIRouter
from pydantic import BaseModel
from app.core.config import settings

router = APIRouter(tags=["Health"])


class HealthResponse(BaseModel):
    status: str = "healthy"
    service: str = "auricle-backend"
    environment: str
    version: str = "1.0.0"


@router.get("/health", response_model=HealthResponse, summary="Backend Health Check")
async def health_check() -> HealthResponse:
    """
    Returns current service health status, environment, and backend version.
    Used by load balancers, monitoring tools, and frontend connectivity checks.
    """
    return HealthResponse(
        status="healthy",
        service="auricle-backend",
        environment=settings.APP_ENV,
        version="1.0.0",
    )
