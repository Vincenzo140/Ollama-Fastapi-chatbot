import {
  ChatMessage,
  ModelDescriptor,
  SessionDetail,
  SessionSummary,
} from '../types';

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '');

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${detail}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  async getModels(): Promise<ModelDescriptor[]> {
    return json(await fetch(`${API_URL}/api/models`));
  },

  async listSessions(): Promise<SessionSummary[]> {
    return json(await fetch(`${API_URL}/api/sessions`));
  },

  async createSession(title: string, model: string): Promise<SessionSummary> {
    return json(
      await fetch(`${API_URL}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, model }),
      }),
    );
  },

  async getSession(id: string): Promise<SessionDetail> {
    return json(await fetch(`${API_URL}/api/sessions/${id}`));
  },

  async renameSession(id: string, title: string): Promise<SessionSummary> {
    return json(
      await fetch(`${API_URL}/api/sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      }),
    );
  },

  async deleteSession(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/sessions/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Failed to delete session: ${res.status}`);
  },
};

export interface StreamHandlers {
  onChunk: (text: string) => void;
  onDone?: (info: { session_id: string | null; model: string }) => void;
  onError?: (message: string) => void;
}

/**
 * POST /api/chat and consume the Server-Sent Events stream.
 * Returns an AbortController so the caller can cancel the generation.
 */
export function streamChat(
  params: {
    messages: ChatMessage[];
    model: string;
    sessionId?: string | null;
    temperature?: number;
    system?: string;
  },
  handlers: StreamHandlers,
): AbortController {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: params.messages,
          model: params.model,
          session_id: params.sessionId ?? null,
          temperature: params.temperature ?? 0.7,
          system: params.system ?? null,
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE events are separated by a blank line.
        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';

        for (const event of events) {
          const line = event.split('\n').find((l) => l.startsWith('data:'));
          if (!line) continue;
          const payload = JSON.parse(line.slice(5).trim());
          if (payload.type === 'chunk') {
            handlers.onChunk(payload.content);
          } else if (payload.type === 'done') {
            handlers.onDone?.({ session_id: payload.session_id, model: payload.model });
          } else if (payload.type === 'error') {
            handlers.onError?.(payload.error);
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        handlers.onError?.((err as Error).message);
      }
    }
  })();

  return controller;
}
