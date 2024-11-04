import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-700 rounded-lg p-4 rounded-tl-none flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <p className="text-sm">Pensando...</p>
      </div>
    </div>
  );
}