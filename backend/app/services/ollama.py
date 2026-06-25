"""Async client for the Ollama HTTP API.

Wraps the subset of endpoints the chatbot needs: listing installed models and
running chat completions (streaming and non-streaming) against ``/api/chat``.
"""

from __future__ import annotations

import json
from collections.abc import AsyncIterator

import httpx

from app.core.config import settings
from app.core.logging import get_logger
from app.schemas.chat import ChatMessage

logger = get_logger("app.ollama")


class OllamaError(RuntimeError):
    """Raised when the Ollama backend is unreachable or returns an error."""


class OllamaService:
    """Thin async wrapper around the Ollama REST API."""

    def __init__(self, base_url: str | None = None, timeout: float | None = None) -> None:
        self._base_url = (base_url or settings.ollama_base_url).rstrip("/")
        self._timeout = timeout or settings.ollama_timeout
        self._client: httpx.AsyncClient | None = None

    async def startup(self) -> None:
        self._client = httpx.AsyncClient(base_url=self._base_url, timeout=self._timeout)

    async def shutdown(self) -> None:
        if self._client is not None:
            await self._client.aclose()
            self._client = None

    @property
    def client(self) -> httpx.AsyncClient:
        if self._client is None:
            raise OllamaError("OllamaService used before startup()")
        return self._client

    async def list_installed_models(self) -> list[str]:
        """Return the names of models currently pulled into Ollama."""
        try:
            res = await self.client.get("/api/tags")
            res.raise_for_status()
        except httpx.HTTPError as exc:
            logger.warning("Could not list Ollama models: %s", exc)
            return []
        data = res.json()
        return [m["name"] for m in data.get("models", [])]

    def _payload(
        self,
        model: str,
        messages: list[ChatMessage],
        temperature: float,
        stream: bool,
    ) -> dict:
        return {
            "model": model,
            "messages": [m.model_dump() for m in messages],
            "stream": stream,
            "options": {"temperature": temperature},
        }

    async def chat_stream(
        self,
        model: str,
        messages: list[ChatMessage],
        temperature: float = 0.7,
    ) -> AsyncIterator[str]:
        """Yield assistant content chunks as they arrive from Ollama."""
        payload = self._payload(model, messages, temperature, stream=True)
        try:
            async with self.client.stream("POST", "/api/chat", json=payload) as res:
                res.raise_for_status()
                async for line in res.aiter_lines():
                    if not line.strip():
                        continue
                    chunk = json.loads(line)
                    if chunk.get("error"):
                        raise OllamaError(chunk["error"])
                    content = chunk.get("message", {}).get("content", "")
                    if content:
                        yield content
                    if chunk.get("done"):
                        break
        except httpx.HTTPError as exc:
            raise OllamaError(f"Ollama request failed: {exc}") from exc

    async def chat(
        self,
        model: str,
        messages: list[ChatMessage],
        temperature: float = 0.7,
    ) -> str:
        """Return the full assistant reply (non-streaming)."""
        payload = self._payload(model, messages, temperature, stream=False)
        try:
            res = await self.client.post("/api/chat", json=payload)
            res.raise_for_status()
        except httpx.HTTPError as exc:
            raise OllamaError(f"Ollama request failed: {exc}") from exc
        data = res.json()
        if data.get("error"):
            raise OllamaError(data["error"])
        return data.get("message", {}).get("content", "")


# Module-level singleton wired into the app lifespan.
ollama_service = OllamaService()
