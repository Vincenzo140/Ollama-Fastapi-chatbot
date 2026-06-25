"""Application configuration loaded from environment variables.

Values can be overridden via a local ``.env`` file (see ``.env.example``).
"""

from __future__ import annotations

from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


# Curated set of free, small (2-4B) models the project ships with.
CURATED_MODELS: list[dict[str, str]] = [
    {
        "name": "gemma2:2b",
        "label": "Gemma 2 2B",
        "description": "Google · ~2B · leve e rápido, ótimo padrão",
    },
    {
        "name": "llama3.2:3b",
        "label": "Llama 3.2 3B",
        "description": "Meta · ~3B · conversação geral e multilíngue",
    },
    {
        "name": "qwen2.5:3b",
        "label": "Qwen 2.5 3B",
        "description": "Alibaba · ~3B · forte em código e raciocínio",
    },
    {
        "name": "dolphin-phi",
        "label": "Dolphin Phi (uncensored)",
        "description": "~2.7B · sem filtros, para uso local",
    },
]


class Settings(BaseSettings):
    """Runtime settings for the API."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_prefix="",
        extra="ignore",
    )

    # API metadata
    app_name: str = "Ollama Chatbot API"
    app_version: str = "0.1.0"
    debug: bool = False

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # Ollama
    ollama_base_url: str = Field(default="http://localhost:11434")
    ollama_timeout: float = 300.0
    default_model: str = "gemma2:2b"

    # CORS — comma-separated list of origins, or "*" for all
    cors_origins: list[str] = Field(default_factory=lambda: ["*"])

    # Storage
    sqlite_path: str = "./data/chat.db"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()


settings = get_settings()
