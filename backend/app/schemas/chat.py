"""Pydantic schemas for chat, sessions and models."""

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

Role = Literal["system", "user", "assistant"]


class ChatMessage(BaseModel):
    """A single message in a conversation."""

    role: Role
    content: str


class ChatRequest(BaseModel):
    """Request body for a chat completion."""

    messages: list[ChatMessage] = Field(..., min_length=1)
    model: str | None = None
    session_id: str | None = None
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    stream: bool = True
    system: str | None = Field(
        default=None, description="Optional system prompt prepended to the conversation"
    )


class ChatResponse(BaseModel):
    """Non-streaming chat response."""

    model: str
    message: ChatMessage
    session_id: str | None = None


class ModelDescriptor(BaseModel):
    """A model exposed to the frontend's model selector."""

    name: str
    label: str
    description: str
    installed: bool = False


class MessageRecord(BaseModel):
    """A persisted message belonging to a session."""

    id: int
    role: Role
    content: str
    created_at: datetime


class SessionSummary(BaseModel):
    """Session metadata shown in the sidebar."""

    id: str
    title: str
    model: str
    created_at: datetime
    updated_at: datetime


class SessionDetail(SessionSummary):
    """A session together with its messages."""

    messages: list[MessageRecord] = Field(default_factory=list)


class CreateSessionRequest(BaseModel):
    title: str = "Nova conversa"
    model: str | None = None


class UpdateSessionRequest(BaseModel):
    title: str
