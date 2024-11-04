import React, { useState } from 'react';
import { Message, SuggestionBlock as SuggestionBlockType } from './types';
import { Header } from './components/Header';
import { SuggestionBlock } from './components/SuggestionBlock';
import { ChatContainer } from './components/ChatContainer';
import { ChatInput } from './components/ChatInput';
import { suggestionBlocks } from './data/suggestionBlocks';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  const handleSuggestionClick = (suggestion: SuggestionBlockType) => {
    setSelectedMode(suggestion.id);
    const botMessage: Message = {
      content: suggestion.prompt,
      isBot: true,
      timestamp: new Date()
    };
    setMessages([botMessage]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      content: input,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`http://192.168.0.9:8000/ask?prompt=${encodeURIComponent(input)}`);
      const data = await response.json();

      const botMessage: Message = {
        content: data.response || 'Desculpe, não consegui processar sua solicitação.',
        isBot: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        content: 'Desculpe, ocorreu um erro. Por favor, tente novamente.',
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedMode(null);
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-5xl mx-auto p-4 h-screen flex flex-col">
        <Header selectedMode={selectedMode} onReset={handleReset} />

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {!selectedMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {suggestionBlocks.map((block) => (
                <SuggestionBlock
                  key={block.id}
                  block={block}
                  onClick={handleSuggestionClick}
                />
              ))}
            </div>
          ) : (
            <ChatContainer messages={messages} isLoading={isLoading} />
          )}
        </div>

        {selectedMode && (
          <ChatInput
            input={input}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            onInputChange={(e) => setInput(e.target.value)}
          />
        )}
      </div>
    </div>
  );
}

export default App;