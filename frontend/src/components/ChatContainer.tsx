import { useEffect, useRef } from 'react';
import { UIMessage } from '../types';
import { ChatMessage } from './ChatMessage';
import { LoadingIndicator } from './LoadingIndicator';

interface ChatContainerProps {
  messages: UIMessage[];
  isStreaming: boolean;
}

export function ChatContainer({ messages, isStreaming }: ChatContainerProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const waitingFirstToken =
    isStreaming && messages.length > 0 && messages[messages.length - 1].content === '';

  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <ChatMessage key={index} message={message} />
      ))}
      {waitingFirstToken && <LoadingIndicator />}
      <div ref={endRef} />
    </div>
  );
}
