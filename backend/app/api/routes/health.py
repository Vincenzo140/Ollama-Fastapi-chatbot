"""Health and metadata endpoints."""

from fastapi import APIRouter

from app.core.config import settings

router = APIRouter()


@router.get("/", summary="Service metadata")
def root() -> dict:
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "ok",
    }


@router.get("/health", summary="Liveness probe")
def health() -> dict:
    return {"status": "ok"}
