import { useCallback, useEffect, useRef, useState } from 'react';
import { api, streamChat } from '../api/client';
import { ModelDescriptor, SessionSummary, UIMessage } from '../types';

export function useChat() {
  const [models, setModels] = useState<ModelDescriptor[]>([]);
  const [model, setModel] = useState<string>('');
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const refreshSessions = useCallback(async () => {
    try {
      setSessions(await api.listSessions());
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    api
      .getModels()
      .then((m) => {
        setModels(m);
        if (m.length) setModel((prev) => prev || m[0].name);
      })
      .catch((err) => setError((err as Error).message));
    refreshSessions();
  }, [refreshSessions]);

  const newChat = useCallback(() => {
    abortRef.current?.abort();
    setCurrentSessionId(null);
    setMessages([]);
    setError(null);
  }, []);

  const selectSession = useCallback(async (id: string) => {
    abortRef.current?.abort();
    setError(null);
    try {
      const detail = await api.getSession(id);
      setCurrentSessionId(detail.id);
      setModel(detail.model);
      setMessages(
        detail.messages.map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: new Date(m.created_at),
        })),
      );
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const deleteSession = useCallback(
    async (id: string) => {
      await api.deleteSession(id);
      if (id === currentSessionId) newChat();
      await refreshSessions();
    },
    [currentSessionId, newChat, refreshSessions],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming || !model) return;
      setError(null);

      // Ensure there is a session to persist into.
      let sessionId = currentSessionId;
      if (!sessionId) {
        const title = trimmed.length > 40 ? `${trimmed.slice(0, 40)}…` : trimmed;
        const session = await api.createSession(title, model);
        sessionId = session.id;
        setCurrentSessionId(session.id);
      }

      const userMsg: UIMessage = { role: 'user', content: trimmed, timestamp: new Date() };
      const history = [...messages, userMsg];
      setMessages([
        ...history,
        { role: 'assistant', content: '', timestamp: new Date(), streaming: true },
      ]);
      setIsStreaming(true);

      abortRef.current = streamChat(
        {
          messages: history.map(({ role, content }) => ({ role, content })),
          model,
          sessionId,
        },
        {
          onChunk: (chunk) => {
            setMessages((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              next[next.length - 1] = { ...last, content: last.content + chunk };
              return next;
            });
          },
          onDone: () => {
            setMessages((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              next[next.length - 1] = { ...last, streaming: false };
              return next;
            });
            setIsStreaming(false);
            refreshSessions();
          },
          onError: (message) => {
            setError(message);
            setMessages((prev) => prev.filter((m) => !(m.streaming && !m.content)));
            setIsStreaming(false);
          },
        },
      );
    },
    [currentSessionId, isStreaming, messages, model, refreshSessions],
  );

  return {
    models,
    model,
    setModel,
    sessions,
    currentSessionId,
    messages,
    isStreaming,
    error,
    newChat,
    selectSession,
    deleteSession,
    sendMessage,
    stop,
  };
}
