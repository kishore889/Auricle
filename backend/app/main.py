from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.core.exceptions import (
    AuricleException,
    auricle_exception_handler,
    http_exception_handler,
    validation_exception_handler,
    unhandled_exception_handler,
)
from app.api.router import api_router
from app.api.routes.health import router as health_router
from app.api.routes.ws import router as ws_router
from app.api.routes.hardware_ws import router as hardware_ws_router
from app.services.websocket import manager


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan context manager handling startup and shutdown events.
    """
    setup_logging()
    logger.info(f"AURICLE Backend Starting — Environment: {settings.APP_ENV}")
    logger.info(f"Allowed CORS Frontend Origins: {settings.ALLOWED_ORIGINS}")
    logger.info(f"API Base Route Prefix: {settings.API_PREFIX}")
    
    # Start WebSocket background task
    manager.start_loop()
    
    yield
    
    # Stop WebSocket background task gracefully
    await manager.stop_loop()
    logger.info("AURICLE Backend Shutting Down.")


app = FastAPI(
    title=settings.APP_NAME,
    description="FastAPI Backend Gateway for AURICLE — AI-Assisted Hearing and Cochlear-Inspired Stimulation Research Prototype.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ─── CORS Middleware Configuration ─────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Exception Handlers Registration ──────────────────────────────────────────
app.add_exception_handler(AuricleException, auricle_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

# ─── Root & Health Endpoints ─────────────────────────────────────────────────
# Direct /health for load balancers / container health probes
app.include_router(health_router)

# WebSocket gateway endpoint
app.include_router(ws_router)

# ESP32 hardware websocket endpoint
app.include_router(hardware_ws_router)

# Prefix API routes under /api (e.g. /api/health)
app.include_router(api_router, prefix=settings.API_PREFIX)


@app.get("/", summary="Root Metadata")
async def root():
    """Returns minimal backend service metadata."""
    return {
        "service": settings.APP_NAME,
        "status": "healthy",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }
