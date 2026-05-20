import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveMessageInput, SaveMessageWithSources } from './types/message.type';
import { ChatService } from '../chat/chat.service';
import { WebSource } from '@perpx/shared/types/message.type';

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
        sources: true,
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

  async getLastMessages(chatId: string, userId: string) {
    await this.chatService.findById(chatId, userId);

    return await this.prisma.message.findMany({
      where: { chatId },
      select: {
        id: true,
        message: true,
        role: true,
        userId: true,
        chatId: true,
        sources: {
          select: {
            title: true,
            url: true,
            snippet: true,
          },
        },
      },
      take: 10,
      orderBy: {
        createdAt: 'asc',
      },
    });
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

  async saveMessageWithSources(data: SaveMessageWithSources) {
    return this.prisma.message.create({
      data: {
        chatId: data.chatId,
        userId: data.userId,
        message: data.message,
        role: data.role,
        sources: {
          create: data.sources?.map((source: WebSource) => ({
            title: source.title,
            url: source.url,
            snippet: source.snippet,
          })),
        },
      },
      select: {
        id: true,
        userId: true,
        chatId: true,
        message: true,
        role: true,
        createdAt: true,
        sources: true,
      },
    });
  }
}
