import { MessageRole } from '@prisma/client';

export type SaveMessageInput = {
  chatId: string;
  userId: string;
  message: string;
  role: MessageRole;
};
