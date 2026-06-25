import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { UIMessage } from '../types';
import { CodeBlock } from './CodeBlock';

interface ChatMessageProps {
  message: UIMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.role !== 'user';

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} gap-2`}>
      {isBot && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl p-4 ${
          isBot ? 'bg-gray-700/50 rounded-tl-none' : 'bg-blue-600 rounded-tr-none'
        }`}
      >
        {isBot ? (
          <div className="prose prose-invert prose-sm max-w-none break-words">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{ pre: CodeBlock }}
            >
              {message.content || ''}
            </ReactMarkdown>
            {message.streaming && (
              <span className="inline-block w-2 h-4 ml-0.5 bg-blue-300 animate-pulse align-middle" />
            )}
          </div>
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}
        <span className="text-xs text-gray-400 mt-2 block">
          {message.timestamp.toLocaleTimeString()}
        </span>
      </div>
      {!isBot && (
        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
}
