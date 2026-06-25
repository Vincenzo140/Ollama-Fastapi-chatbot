"""Chat completion (streaming) and session management endpoints."""

from __future__ import annotations

import json
from collections.abc import AsyncIterator

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse

from app.core.config import settings
from app.core.logging import get_logger
from app.db.sessions import session_store
from app.schemas.chat import (
    ChatMessage,
    ChatRequest,
    ChatResponse,
    CreateSessionRequest,
    SessionDetail,
    SessionSummary,
    UpdateSessionRequest,
)
from app.services.ollama import OllamaError, ollama_service

logger = get_logger("app.chat")
router = APIRouter()


def _build_messages(req: ChatRequest) -> list[ChatMessage]:
    """Prepend an optional system prompt to the conversation."""
    if req.system:
        return [ChatMessage(role="system", content=req.system), *req.messages]
    return list(req.messages)


def _sse(event: dict) -> str:
    return f"data: {json.dumps(event, ensure_ascii=False)}\n\n"


@router.post("/chat", summary="Chat completion (streaming SSE by default)")
async def chat(req: ChatRequest):
    model = req.model or settings.default_model
    messages = _build_messages(req)
    last_user = req.messages[-1]

    # Persist the incoming user turn if it belongs to a session.
    if req.session_id and last_user.role == "user":
        await session_store.add_message(req.session_id, "user", last_user.content)

    if not req.stream:
        try:
            content = await ollama_service.chat(model, messages, req.temperature)
        except OllamaError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)
            ) from exc
        if req.session_id:
            await session_store.add_message(req.session_id, "assistant", content)
        return ChatResponse(
            model=model,
            message=ChatMessage(role="assistant", content=content),
            session_id=req.session_id,
        )

    async def event_stream() -> AsyncIterator[str]:
        parts: list[str] = []
        try:
            async for chunk in ollama_service.chat_stream(
                model, messages, req.temperature
            ):
                parts.append(chunk)
                yield _sse({"type": "chunk", "content": chunk})
        except OllamaError as exc:
            logger.error("Stream failed: %s", exc)
            yield _sse({"type": "error", "error": str(exc)})
            return
        full = "".join(parts)
        if req.session_id and full:
            await session_store.add_message(req.session_id, "assistant", full)
        yield _sse({"type": "done", "session_id": req.session_id, "model": model})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# --------------------------------------------------------------------------- #
# Session management
# --------------------------------------------------------------------------- #


@router.get("/sessions", response_model=list[SessionSummary], summary="List sessions")
async def list_sessions() -> list[SessionSummary]:
    return await session_store.list_sessions()


@router.post(
    "/sessions",
    response_model=SessionSummary,
    status_code=status.HTTP_201_CREATED,
    summary="Create session",
)
async def create_session(req: CreateSessionRequest) -> SessionSummary:
    model = req.model or settings.default_model
    return await session_store.create_session(req.title, model)


@router.get(
    "/sessions/{session_id}", response_model=SessionDetail, summary="Get session"
)
async def get_session(session_id: str) -> SessionDetail:
    detail = await session_store.get_session(session_id)
    if detail is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return detail


@router.patch(
    "/sessions/{session_id}", response_model=SessionSummary, summary="Rename session"
)
async def rename_session(session_id: str, req: UpdateSessionRequest) -> SessionSummary:
    ok = await session_store.rename_session(session_id, req.title)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    detail = await session_store.get_session(session_id)
    assert detail is not None
    return detail


@router.delete(
    "/sessions/{session_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete session",
)
async def delete_session(session_id: str) -> None:
    ok = await session_store.delete_session(session_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
