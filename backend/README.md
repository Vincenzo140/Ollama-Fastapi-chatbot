# Backend — Ollama Chatbot API

FastAPI service that proxies a local Ollama instance running small (2–4B) models,
with streaming chat completions and SQLite-backed sessions.

See the [root README](../README.md) for the full setup guide.

## Quick start

```sh
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

## Endpoints

| Method | Path                    | Description                          |
| ------ | ----------------------- | ------------------------------------ |
| GET    | `/health`               | Liveness probe                       |
| GET    | `/api/models`           | Curated models + installed flag      |
| POST   | `/api/chat`             | Chat completion (SSE streaming)      |
| GET    | `/api/sessions`         | List sessions                        |
| POST   | `/api/sessions`         | Create session                       |
| GET    | `/api/sessions/{id}`    | Session detail + messages            |
| PATCH  | `/api/sessions/{id}`    | Rename session                       |
| DELETE | `/api/sessions/{id}`    | Delete session                       |

Interactive docs at `/docs`.
