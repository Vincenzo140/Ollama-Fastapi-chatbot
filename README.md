# Ollama FastAPI Chatbot

Chatbot local que roda **LLMs pequenas e gratuitas (2–4B)** via [Ollama](https://ollama.com),
com backend em **FastAPI** e frontend em **React + Vite + TypeScript**.

## Features

- 🔄 **Streaming** de respostas token-a-token (SSE)
- 💬 **Sessões/histórico** persistidos em SQLite (sidebar com várias conversas)
- 🧠 **Troca de modelo na UI** entre os modelos curados
- 📝 **Markdown + syntax highlight** com botão de copiar código

## Modelos incluídos

| Modelo         | Tamanho | Origem    | Observação                          |
| -------------- | ------- | --------- | ----------------------------------- |
| `gemma2:2b`    | ~2B     | Google    | Padrão, leve e rápido               |
| `llama3.2:3b`  | ~3B     | Meta      | Conversação geral, multilíngue      |
| `qwen2.5:3b`   | ~3B     | Alibaba   | Forte em código e raciocínio        |
| `dolphin-phi`  | ~2.7B   | Cognitive | Uncensored, para uso local          |

## Estrutura

```
backend/
  app/
    main.py            # app factory + lifespan
    core/              # config (pydantic-settings) e logging
    api/routes/        # chat, sessions, models, health
    schemas/           # modelos Pydantic
    services/ollama.py # cliente async do Ollama (stream + non-stream)
    db/sessions.py     # persistência SQLite (aiosqlite)
  ollama/              # imagem do Ollama + pull-models.sh
  Dockerfile, docker-compose.yml, pyproject.toml, requirements.txt
frontend/
  src/
    api/client.ts      # cliente HTTP + parser de stream SSE
    hooks/useChat.ts    # estado do chat
    components/         # Sidebar, Header, ModelSelector, ChatMessage, ...
```

## Como rodar

### Opção A — Docker (tudo junto)

```sh
cd backend
docker compose up --build
```

Sobe a API em `http://localhost:8000` e o Ollama em `http://localhost:11434`
(baixando os modelos automaticamente na primeira execução).

### Opção B — Local

**Backend** (precisa do Ollama rodando na máquina):

```sh
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Linux/macOS
pip install -r requirements.txt
cp .env.example .env          # ajuste se necessário
uvicorn app.main:app --reload
```

Baixe os modelos no Ollama:

```sh
ollama pull gemma2:2b
ollama pull llama3.2:3b
ollama pull qwen2.5:3b
ollama pull dolphin-phi
```

**Frontend**:

```sh
cd frontend
npm install
cp .env.example .env          # VITE_API_URL=http://localhost:8000
npm run dev
```

## Configuração

Variáveis principais (`backend/.env`):

| Variável          | Padrão                    | Descrição                       |
| ----------------- | ------------------------- | ------------------------------- |
| `OLLAMA_BASE_URL` | `http://localhost:11434`  | URL do servidor Ollama          |
| `DEFAULT_MODEL`   | `gemma2:2b`               | Modelo padrão                   |
| `CORS_ORIGINS`    | `*`                       | Origens permitidas (CSV ou `*`) |
| `SQLITE_PATH`     | `./data/chat.db`          | Caminho do banco                |

Docs interativas da API em `http://localhost:8000/docs`.
