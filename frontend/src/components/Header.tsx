import { Bot } from 'lucide-react';
import { ModelDescriptor } from '../types';
import { ModelSelector } from './ModelSelector';

interface HeaderProps {
  models: ModelDescriptor[];
  model: string;
  modelLocked: boolean;
  onModelChange: (model: string) => void;
}

export function Header({ models, model, modelLocked, onModelChange }: HeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-800">
      <div className="flex items-center gap-2">
        <Bot className="w-7 h-7 text-blue-400" />
        <h1 className="text-lg font-bold">ChatBot Local</h1>
      </div>
      <ModelSelector
        models={models}
        value={model}
        disabled={modelLocked}
        onChange={onModelChange}
      />
    </div>
  );
}
