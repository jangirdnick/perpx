import { ApiSuccess, ApiSuccessResponse, ApiErrorResponse } from './api.type';

export type Chat = {
  id: string;
  title: string;
  description: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UpdateTitleData = {
  id: string;
  title: string;
  updatedAt: Date;
};

export type DeleteChatData = {
  id: string;
  title: string;
};

export type ChatResponse = ApiSuccessResponse<{ chat: Chat }> | ApiErrorResponse;
export type ChatListResponse = ApiSuccessResponse<{ chats: Chat[] }> | ApiErrorResponse;
export type ChatDeleteResponse = ApiSuccessResponse<DeleteChatData> | ApiErrorResponse;
export type ChatUpdateTitleResponse = ApiSuccessResponse<UpdateTitleData> | ApiErrorResponse;
