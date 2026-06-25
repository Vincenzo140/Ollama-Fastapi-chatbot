import React from 'react';

export type Role = 'system' | 'user' | 'assistant';

/** A message as sent to / received from the backend. */
export interface ChatMessage {
  role: Role;
  content: string;
}

/** A message as rendered in the UI (adds local-only metadata). */
export interface UIMessage extends ChatMessage {
  timestamp: Date;
  streaming?: boolean;
}

export interface ModelDescriptor {
  name: string;
  label: string;
  description: string;
  installed: boolean;
}

export interface SessionSummary {
  id: string;
  title: string;
  model: string;
  created_at: string;
  updated_at: string;
}

export interface SessionDetail extends SessionSummary {
  messages: {
    id: number;
    role: Role;
    content: string;
    created_at: string;
  }[];
}

export interface SuggestionBlock {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
  gradient: string;
}
