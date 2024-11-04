export interface Message {
  content: string;
  isBot: boolean;
  timestamp: Date;
}

export interface SuggestionBlock {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
  gradient: string;
}