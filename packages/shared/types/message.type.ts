import { ApiSuccessResponse, ApiErrorResponse } from './api.type';

type MESSAGE_ROLE = 'HUMAN' | 'AI';

export type Message = {
  id: string;
  message: string;
  role: MESSAGE_ROLE;
  userId: string;
  chatId: string;
  createdAt: string;
};

export type DeleteMessage = {
  id: string;
  chatId: string;
  userId: string;
  role: MESSAGE_ROLE;
};

export type SendMessagePayload = {
  message: string;
  chatId?: string;
  feature?: 'normal' | 'web_search' | 'file_rag';
  model?: 'gemini' | 'mistral';
};


export type MessageResponse = ApiSuccessResponse<Message> | ApiErrorResponse;
export type MessageListResponse = ApiSuccessResponse<{messages: Message[]}> | ApiErrorResponse;
export type MessageDeleteResponse = ApiSuccessResponse<DeleteMessage> | ApiErrorResponse;
