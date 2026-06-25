"""API router aggregation."""

from fastapi import APIRouter

from app.api.routes import chat, health, models

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(models.router, prefix="/api", tags=["models"])
api_router.include_router(chat.router, prefix="/api", tags=["chat"])
