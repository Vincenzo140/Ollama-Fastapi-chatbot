import { MessageSquarePlus, Trash2, MessageSquare } from 'lucide-react';
import { SessionSummary } from '../types';

interface SidebarProps {
  sessions: SessionSummary[];
  currentSessionId: string | null;
  onNewChat: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function Sidebar({
  sessions,
  currentSessionId,
  onNewChat,
  onSelect,
  onDelete,
}: SidebarProps) {
  return (
    <aside className="w-64 shrink-0 bg-gray-900/80 border-r border-gray-800 flex flex-col h-full">
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
        >
          <MessageSquarePlus className="w-4 h-4" />
          Nova conversa
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
        {sessions.length === 0 && (
          <p className="text-xs text-gray-500 text-center mt-4">Nenhuma conversa ainda</p>
        )}
        {sessions.map((s) => (
          <div
            key={s.id}
            className={`group flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-colors ${
              s.id === currentSessionId ? 'bg-gray-700/70' : 'hover:bg-gray-800/60'
            }`}
            onClick={() => onSelect(s.id)}
          >
            <MessageSquare className="w-4 h-4 shrink-0 text-gray-400" />
            <span className="flex-1 truncate text-sm">{s.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(s.id);
              }}
              className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity"
              aria-label="Excluir conversa"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
}
