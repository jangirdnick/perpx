import { api } from '../../../lib/axios';
import { ChatListResponse, ChatDeleteResponse } from '@perpx/shared/types/chat.type';
import { MessageListResponse } from '@perpx/shared/types/message.type';

export async function getUserChats(): Promise<ChatListResponse> {
  const { data } = await api.get('/chat');
  return data;
}

export async function getChatMessages(chatId: string): Promise<MessageListResponse> {
  const { data } = await api.get(`/message/${chatId}`);
  return data;
}

export async function renameChat({ chatId, title }: { chatId: string; title: string }) {
  const { data } = await api.post(`/rename/${chatId}`, { title });
  return data;
}

export async function deleteChat(chatId: string): Promise<ChatDeleteResponse> {
  const { data } = await api.delete(`/chat/delete/${chatId}`);
  return data;
}
