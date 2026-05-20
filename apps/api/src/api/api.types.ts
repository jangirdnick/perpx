// src/api/api.types.ts
export type ModelType = 'gemini' | 'mistral';
export type Role = 'user' | 'ai';

export interface AttachmentInput {
  fileUrl?: string | undefined;
  type: string;
  name: string;
}

export interface ChatMessage {
  role: Role;
  content: string;
  attachments?: AttachmentInput[];
}

export interface TavilyResultItem {
  title?: string;
  url?: string;
  content?: string;
  snippet?: string;
}

export type MessagePart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };
