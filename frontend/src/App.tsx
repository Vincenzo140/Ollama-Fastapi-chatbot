import { AlertTriangle } from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatContainer } from './components/ChatContainer';
import { ChatInput } from './components/ChatInput';
import { SuggestionBlock } from './components/SuggestionBlock';
import { suggestionBlocks } from './data/suggestionBlocks';
import { useChat } from './hooks/useChat';

function App() {
  const {
    models,
    model,
    setModel,
    sessions,
    currentSessionId,
    messages,
    isStreaming,
    error,
    newChat,
    selectSession,
    deleteSession,
    sendMessage,
    stop,
  } = useChat();

  const isEmpty = messages.length === 0;

  return (
    <div className="h-screen flex bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewChat={newChat}
        onSelect={selectSession}
        onDelete={deleteSession}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          models={models}
          model={model}
          modelLocked={isStreaming}
          onModelChange={setModel}
        />

        <div className="flex-1 overflow-y-auto p-4">
          {isEmpty ? (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-1">Como posso ajudar?</h2>
              <p className="text-gray-400 mb-6 text-sm">
                Escolha um modo ou digite sua mensagem.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestionBlocks.map((block) => (
                  <SuggestionBlock
                    key={block.id}
                    block={block}
                    onClick={(b) => sendMessage(b.prompt)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <ChatContainer messages={messages} isStreaming={isStreaming} />
            </div>
          )}
        </div>

        {error && (
          <div className="max-w-4xl mx-auto w-full px-4">
            <div className="flex items-center gap-2 bg-red-900/40 border border-red-700 rounded-lg px-3 py-2 text-sm text-red-200">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="truncate">{error}</span>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto w-full">
          <ChatInput isStreaming={isStreaming} onSend={sendMessage} onStop={stop} />
        </div>
      </div>
    </div>
  );
}

export default App;
