import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveMessageInput } from './types/message.type';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class MessageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chatService: ChatService,
  ) {}

  async getChatMessages(chatId: string, userId: string) {
    await this.chatService.findById(chatId, userId);

    const messages = await this.prisma.message.findMany({
      where: { chatId },
      select: {
        id: true,
        message: true,
        role: true,
        userId: true,
        chatId: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return {
      success: true,
      data: {
        messages: messages,
      },
      message: 'Messages fetched successfully',
    };
  }

  async saveMessage(data: SaveMessageInput) {
    return this.prisma.message.create({
      data: { ...data },
      select: {
        id: true,
        userId: true,
        chatId: true,
        message: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async deleteMessage(messageId: string, userId: string) {
    return this.prisma.message.delete({
      where: { id: messageId, userId },
      select: {
        id: true,
        chatId: true,
        userId: true,
        role: true,
      },
    });
  }
}
