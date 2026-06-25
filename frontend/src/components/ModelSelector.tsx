import { Cpu } from 'lucide-react';
import { ModelDescriptor } from '../types';

interface ModelSelectorProps {
  models: ModelDescriptor[];
  value: string;
  disabled?: boolean;
  onChange: (model: string) => void;
}

export function ModelSelector({ models, value, disabled, onChange }: ModelSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Cpu className="w-4 h-4 text-blue-400" />
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {models.map((m) => (
          <option key={m.name} value={m.name}>
            {m.label}
            {m.installed ? '' : ' (não instalado)'}
          </option>
        ))}
      </select>
    </div>
  );
}
