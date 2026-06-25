"""SQLite-backed persistence for chat sessions and messages."""

from __future__ import annotations

import os
import uuid
from datetime import datetime, timezone

import aiosqlite

from app.core.config import settings
from app.schemas.chat import (
    MessageRecord,
    Role,
    SessionDetail,
    SessionSummary,
)

_SCHEMA = """
CREATE TABLE IF NOT EXISTS sessions (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    model       TEXT NOT NULL,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id  TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    role        TEXT NOT NULL,
    content     TEXT NOT NULL,
    created_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
"""


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class SessionStore:
    """Async repository for sessions and their messages."""

    def __init__(self, db_path: str | None = None) -> None:
        self._db_path = db_path or settings.sqlite_path
        self._db: aiosqlite.Connection | None = None

    async def startup(self) -> None:
        os.makedirs(os.path.dirname(os.path.abspath(self._db_path)), exist_ok=True)
        self._db = await aiosqlite.connect(self._db_path)
        self._db.row_factory = aiosqlite.Row
        await self._db.execute("PRAGMA foreign_keys = ON")
        await self._db.executescript(_SCHEMA)
        await self._db.commit()

    async def shutdown(self) -> None:
        if self._db is not None:
            await self._db.close()
            self._db = None

    @property
    def db(self) -> aiosqlite.Connection:
        if self._db is None:
            raise RuntimeError("SessionStore used before startup()")
        return self._db

    async def create_session(self, title: str, model: str) -> SessionSummary:
        session_id = uuid.uuid4().hex
        ts = _now()
        await self.db.execute(
            "INSERT INTO sessions (id, title, model, created_at, updated_at)"
            " VALUES (?, ?, ?, ?, ?)",
            (session_id, title, model, ts, ts),
        )
        await self.db.commit()
        return SessionSummary(
            id=session_id, title=title, model=model, created_at=ts, updated_at=ts
        )

    async def list_sessions(self) -> list[SessionSummary]:
        cursor = await self.db.execute(
            "SELECT id, title, model, created_at, updated_at"
            " FROM sessions ORDER BY updated_at DESC"
        )
        rows = await cursor.fetchall()
        return [SessionSummary(**dict(row)) for row in rows]

    async def get_session(self, session_id: str) -> SessionDetail | None:
        cursor = await self.db.execute(
            "SELECT id, title, model, created_at, updated_at FROM sessions WHERE id = ?",
            (session_id,),
        )
        row = await cursor.fetchone()
        if row is None:
            return None
        messages = await self.get_messages(session_id)
        return SessionDetail(**dict(row), messages=messages)

    async def get_messages(self, session_id: str) -> list[MessageRecord]:
        cursor = await self.db.execute(
            "SELECT id, role, content, created_at FROM messages"
            " WHERE session_id = ? ORDER BY id ASC",
            (session_id,),
        )
        rows = await cursor.fetchall()
        return [MessageRecord(**dict(row)) for row in rows]

    async def add_message(self, session_id: str, role: Role, content: str) -> None:
        ts = _now()
        await self.db.execute(
            "INSERT INTO messages (session_id, role, content, created_at)"
            " VALUES (?, ?, ?, ?)",
            (session_id, role, content, ts),
        )
        await self.db.execute(
            "UPDATE sessions SET updated_at = ? WHERE id = ?", (ts, session_id)
        )
        await self.db.commit()

    async def rename_session(self, session_id: str, title: str) -> bool:
        cursor = await self.db.execute(
            "UPDATE sessions SET title = ?, updated_at = ? WHERE id = ?",
            (title, _now(), session_id),
        )
        await self.db.commit()
        return cursor.rowcount > 0

    async def delete_session(self, session_id: str) -> bool:
        cursor = await self.db.execute(
            "DELETE FROM sessions WHERE id = ?", (session_id,)
        )
        await self.db.commit()
        return cursor.rowcount > 0


# Module-level singleton wired into the app lifespan.
session_store = SessionStore()
