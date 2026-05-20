import { MessageRole } from '@prisma/client';
import { WebSource } from '@perpx/shared/types/message.type';

export type SaveMessageInput = {
  chatId: string;
  userId: string;
  message: string;
  role: MessageRole;
};

export type SaveMessageWithSources = {
  chatId: string;
  userId: string;
  message: string;
  role: MessageRole;
  sources?: WebSource[];
};

export type SaveMessageResponse = {
  id: string;
  chatId: string;
  userId: string;
  message: string;
  role: MessageRole;
  sources?: WebSource[];
  createdAt: Date;
};
