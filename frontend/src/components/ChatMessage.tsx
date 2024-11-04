import React from 'react';
import { Message } from '../types';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} gap-2`}>
      {message.isBot && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl p-4 ${
          message.isBot
            ? 'bg-gray-700/50 backdrop-blur-sm'
            : 'bg-blue-600 backdrop-blur-sm'
        } ${message.isBot ? 'rounded-tl-none' : 'rounded-tr-none'}`}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
        <span className="text-xs text-gray-400 mt-1 block">
          {message.timestamp.toLocaleTimeString()}
        </span>
      </div>
      {!message.isBot && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
}