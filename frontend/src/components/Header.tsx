import React from 'react';
import { Bot } from 'lucide-react';

interface HeaderProps {
  selectedMode: string | null;
  onReset: () => void;
}

export function Header({ selectedMode, onReset }: HeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-700">
      <div className="flex items-center gap-2">
        <Bot className="w-8 h-8 text-blue-400" />
        <h1 className="text-xl font-bold">ChatBot Inteligente</h1>
      </div>
      {selectedMode && (
        <button
          onClick={onReset}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Voltar ao Início
        </button>
      )}
    </div>
  );
}