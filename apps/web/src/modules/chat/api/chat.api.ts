import { api } from '../../../lib/axios';
import { ChatListResponse, ChatDeleteResponse } from '@perpx/shared/types/chat.type';
import { MessageListResponse } from '@perpx/shared/types/message.type';

export async function getSidebarUserChats(): Promise<ChatListResponse> {
  const { data } = await api.get('/chat');
  return data;
}

export async function getChatMessages(chatId: string): Promise<MessageListResponse> {
  const { data } = await api.get(`/message/${chatId}`);
  return data;
}

export async function getChatHistory({
  pageParam,
  limit = 20,
}: {
  pageParam?: string;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (pageParam) params.append('cursor', pageParam);
  if (limit) params.append('limit', limit.toString());
  const { data } = await api.get(`/chat/history/infinite?${params.toString()}`);
  return data as import('@perpx/shared/types/chat.type').ChatHistoryResponse;
}

export async function renameChat({ chatId, title }: { chatId: string; title: string }) {
  const { data } = await api.post(`/chat/rename/${chatId}`, { title });
  return data;
}

export async function getSpaceChats(spaceId: string): Promise<ChatListResponse> {
  const { data } = await api.get(`/chat/space/${spaceId}`);
  return data;
}

export async function getSpaceChatHistory({
  spaceId,
  pageParam,
  limit = 20,
}: {
  spaceId: string;
  pageParam?: string;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (pageParam) params.append('cursor', pageParam);
  if (limit) params.append('limit', limit.toString());
  const { data } = await api.get(`/chat/space/${spaceId}/infinite?${params.toString()}`);
  return data as import('@perpx/shared/types/chat.type').ChatHistoryResponse;
}

export async function deleteChat(chatId: string): Promise<ChatDeleteResponse> {
  const { data } = await api.delete(`/chat/delete/${chatId}`);
  return data;
}

export async function clearAllChatsApi() {
  const { data } = await api.delete('/chat/clear-all');
  return data;
}

export async function updateSpaceChat({
  spaceId,
  chatId,
  title,
}: {
  spaceId: string;
  chatId: string;
  title: string;
}) {
  const { data } = await api.patch(`/chat/space/${spaceId}/${chatId}`, { title });
  return data;
}

export async function deleteSpaceChat({
  spaceId,
  chatId,
}: {
  spaceId: string;
  chatId: string;
}): Promise<ChatDeleteResponse> {
  const { data } = await api.delete(`/chat/space/${spaceId}/${chatId}`);
  return data;
}
