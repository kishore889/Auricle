from fastapi import APIRouter
from app.api.routes import (
    health,
    auth,
    device,
    audio,
    sound_analysis,
    speech,
    channels,
    ai,
    history,
    alerts,
    logs,
    profile,
    sessions,
)

api_router = APIRouter()

# Health check under /api/health
api_router.include_router(health.router)

# Authentication under /api/auth/*
api_router.include_router(auth.router)

# Core REST APIs
api_router.include_router(device.router)
api_router.include_router(audio.router)
api_router.include_router(sound_analysis.router)
api_router.include_router(speech.router)
api_router.include_router(channels.router)
api_router.include_router(ai.router)
api_router.include_router(history.router)
api_router.include_router(alerts.router)
api_router.include_router(logs.router)
api_router.include_router(profile.router)
api_router.include_router(sessions.router)
