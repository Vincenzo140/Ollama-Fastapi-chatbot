import React from 'react';
import { SuggestionBlock as SuggestionBlockType } from '../types';

interface SuggestionBlockProps {
  block: SuggestionBlockType;
  onClick: (block: SuggestionBlockType) => void;
}

export function SuggestionBlock({ block, onClick }: SuggestionBlockProps) {
  return (
    <div
      onClick={() => onClick(block)}
      className={`bg-gradient-to-br ${block.gradient} rounded-lg p-6 cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
          {block.icon}
        </div>
        <h3 className="text-lg font-bold text-white">{block.title}</h3>
      </div>
      <p className="text-white/90 text-sm leading-relaxed">{block.description}</p>
    </div>
  );
}