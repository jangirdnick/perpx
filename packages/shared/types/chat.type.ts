import { ApiSuccess, ApiSuccessResponse, ApiErrorResponse } from './api.type';
import { Space } from './space.type';

export type Chat = {
  id: string;
  title: string;
  description: string;
  userId: string;
  spaceId?: string | null;
  space?: Space | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateTitleData = {
  id: string;
  title: string;
  updatedAt: string;
};

export type DeleteChatData = {
  id: string;
  title: string;
};

export type ChatResponse = ApiSuccessResponse<{ chat: Chat }> | ApiErrorResponse;
export type ChatListResponse = ApiSuccessResponse<{ chats: Chat[] }> | ApiErrorResponse;
export type ChatHistoryResponse = ApiSuccessResponse<{ chats: Chat[]; nextCursor: string | null }> | ApiErrorResponse;
export type ChatDeleteResponse = ApiSuccessResponse<DeleteChatData> | ApiErrorResponse;
export type ChatUpdateTitleResponse = ApiSuccessResponse<{ chat: Chat }> | ApiErrorResponse;
