"""Endpoint exposing the available models for the UI selector."""

from fastapi import APIRouter

from app.core.config import CURATED_MODELS
from app.schemas.chat import ModelDescriptor
from app.services.ollama import ollama_service

router = APIRouter()


@router.get("/models", response_model=list[ModelDescriptor], summary="List models")
async def list_models() -> list[ModelDescriptor]:
    """Return curated models, flagging which are already pulled into Ollama."""
    installed = set(await ollama_service.list_installed_models())
    return [
        ModelDescriptor(
            name=m["name"],
            label=m["label"],
            description=m["description"],
            installed=m["name"] in installed,
        )
        for m in CURATED_MODELS
    ]
