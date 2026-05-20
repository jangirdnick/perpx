import { ApiSuccessResponse, ApiErrorResponse } from './api.type';

type MESSAGE_ROLE = 'HUMAN' | 'AI';

export interface Attachment {
  fileUrl: string;
  type: string;
  name: string;
}
export interface WebSource {
  title: string;
  url: string;
  snippet: string;
}

export interface Message {
  id: string;
  chatId: string;
  userId: string;
  role: 'AI' | 'HUMAN';
  message: string;
  createdAt: string;
  sources?: WebSource[];
}

export type DeleteMessage = {
  id: string;
  chatId: string;
  userId: string;
  role: MESSAGE_ROLE;
};

export type SendMessagePayload = {
  message: string;
  chatId?: string;
  webSearch: boolean;
  attachments?: Attachment[];
};

export type MessageResponse = ApiSuccessResponse<Message> | ApiErrorResponse;
export type MessageListResponse = ApiSuccessResponse<{ messages: Message[] }> | ApiErrorResponse;
export type MessageDeleteResponse = ApiSuccessResponse<DeleteMessage> | ApiErrorResponse;
