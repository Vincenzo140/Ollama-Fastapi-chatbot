import { useState, KeyboardEvent } from 'react';
import { Send, Square } from 'lucide-react';

interface ChatInputProps {
  isStreaming: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
}

export function ChatInput({ isStreaming, onSend, onStop }: ChatInputProps) {
  const [value, setValue] = useState('');

  const submit = () => {
    if (!value.trim() || isStreaming) return;
    onSend(value);
    setValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="p-4 border-t border-gray-800">
      <div className="flex gap-2 items-end">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem... (Enter envia, Shift+Enter quebra linha)"
          rows={1}
          className="flex-1 resize-none bg-gray-800 rounded-lg px-4 py-2 max-h-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {isStreaming ? (
          <button
            onClick={onStop}
            className="bg-red-600 hover:bg-red-700 p-2.5 rounded-lg transition-colors"
            aria-label="Parar geração"
          >
            <Square className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={!value.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed p-2.5 rounded-lg transition-colors"
            aria-label="Enviar"
          >
            <Send className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
