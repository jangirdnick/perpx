import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async createChat(userId: string) {
    const chat = await this.prisma.chat.create({
      data: {
        userId,
        title: 'New Chat',
      },
      select: {
        id: true,
        title: true,
        description: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      data: {
        chat,
      },
      message: 'Chat created successfully',
    };
  }

  async findById(chatId: string, userId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      select: {
        id: true,
        title: true,
        description: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (userId && chat.userId !== userId) {
      throw new ForbiddenException('You do not have access to this chat');
    }

    return {
      success: true,
      data: {
        chat,
      },
      message: 'Chat found successfully',
    };
  }

  async updateTitle(chatId: string, title: string, userId?: string) {
    if (userId) {
      const chat = await this.findById(chatId, userId);
      if (!chat) {
        throw new NotFoundException('Chat not found');
      }
    }

    const chat = await this.prisma.chat.update({
      where: { id: chatId },
      data: { title },
      select: {
        id: true,
        title: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      data: {
        chat,
      },
      message: `${chat.title} updated successfully`,
    };
  }

  async getSidebarUserChats(userId: string) {
    const chat = await this.prisma.chat.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        description: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
      take: 15,
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return {
      success: true,
      data: {
        chats: chat,
      },
      message: 'Chats retrieved successfully',
    };
  }

  async deleteChat(chatId: string, userId: string) {
    const chat = await this.prisma.chat.delete({
      where: { id: chatId, userId },
      select: {
        id: true,
        title: true,
      },
    });

    return {
      success: true,
      data: {
        chat,
      },
      message: `${chat.title} deleted successfully`,
    };
  }
}
