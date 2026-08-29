import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async createChat(userId: string, spaceId?: string) {
    if (spaceId) {
      const space = await this.prisma.space.findUnique({
        where: { id: spaceId },
        include: { spaceMembers: true },
      });
      if (!space) {
        throw new NotFoundException('Space not found');
      }
      const isMember = space.spaceMembers.some((m) => m.userId === userId);
      if (!isMember) {
        throw new ForbiddenException(
          'You must be a member of the space to create a chat in it',
        );
      }
    }

    const chat = await this.prisma.chat.create({
      data: {
        userId,
        title: 'New Chat',
        spaceId: spaceId || null,
      },
      select: {
        id: true,
        title: true,
        description: true,
        userId: true,
        spaceId: true,
        createdAt: true,
        updatedAt: true,
        space: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            createdAt: true,
            updatedAt: true,
            spaceMembers: {
              where: { userId },
              select: { id: true, role: true, userId: true },
            },
          },
        },
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
        spaceId: true,
        createdAt: true,
        updatedAt: true,
        space: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            createdAt: true,
            updatedAt: true,
            spaceMembers: {
              where: { userId },
              select: { id: true, role: true, userId: true },
            },
          },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.spaceId && chat.space) {
      if (
        chat.space.type !== 'PUBLIC' &&
        chat.space.spaceMembers.length === 0
      ) {
        throw new ForbiddenException(
          'You do not have access to this space chat',
        );
      }
    } else if (userId && chat.userId !== userId) {
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
      const chat = await this.prisma.chat.findFirst({
        where: { id: chatId, userId, spaceId: null },
      });
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

  async updateTimestamp(chatId: string) {
    const chat = await this.prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
      select: {
        id: true,
        updatedAt: true,
      },
    });
    return chat;
  }

  async getSidebarUserChats(userId: string) {
    const chat = await this.prisma.chat.findMany({
      where: { userId, spaceId: null },
      select: {
        id: true,
        title: true,
        description: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
      take: 25,
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

  async getHistoryChats(userId: string, cursor?: string, limit: number = 20) {
    const chats = await this.prisma.chat.findMany({
      where: { userId, spaceId: null },
      select: {
        id: true,
        title: true,
        description: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
      take: limit + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        updatedAt: 'desc',
      },
    });

    let nextCursor: string | null = null;
    if (chats.length > limit) {
      chats.pop();
      nextCursor = chats[chats.length - 1].id;
    }

    return {
      success: true,
      data: {
        chats,
        nextCursor,
      },
      message: 'History chats retrieved successfully',
    };
  }

  async getSpaceChats(spaceId: string, userId: string) {
    const space = await this.prisma.space.findUnique({
      where: { id: spaceId },
      include: {
        spaceMembers: {
          where: { userId },
        },
      },
    });

    if (!space) {
      throw new NotFoundException('Space not found');
    }

    if (space.type !== 'PUBLIC' && space.spaceMembers.length === 0) {
      throw new ForbiddenException('You do not have access to this space');
    }

    const chats = await this.prisma.chat.findMany({
      where: { spaceId },
      select: {
        id: true,
        title: true,
        description: true,
        userId: true,
        spaceId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return {
      success: true,
      data: {
        chats,
      },
      message: 'Space chats retrieved successfully',
    };
  }

  async getSpaceChatsInfinite(
    spaceId: string,
    userId: string,
    cursor?: string,
    limit: number = 20,
  ) {
    const space = await this.prisma.space.findUnique({
      where: { id: spaceId },
      include: {
        spaceMembers: {
          where: { userId },
        },
      },
    });

    if (!space) {
      throw new NotFoundException('Space not found');
    }

    if (space.type !== 'PUBLIC' && space.spaceMembers.length === 0) {
      throw new ForbiddenException('You do not have access to this space');
    }

    const chats = await this.prisma.chat.findMany({
      where: { spaceId },
      select: {
        id: true,
        title: true,
        description: true,
        userId: true,
        spaceId: true,
        createdAt: true,
        updatedAt: true,
      },
      take: limit + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        updatedAt: 'desc',
      },
    });

    let nextCursor: string | null = null;
    if (chats.length > limit) {
      chats.pop();
      nextCursor = chats[chats.length - 1].id;
    }

    return {
      success: true,
      data: {
        chats,
        nextCursor,
      },
      message: 'Space chats retrieved successfully',
    };
  }

  async deleteChat(chatId: string, userId: string) {
    const chat = await this.prisma.chat.findFirst({
      where: { id: chatId, userId, spaceId: null },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const deletedChat = await this.prisma.chat.delete({
      where: { id: chatId },
      select: {
        id: true,
        title: true,
      },
    });

    return {
      success: true,
      data: {
        chat: deletedChat,
      },
      message: `${deletedChat.title} deleted successfully`,
    };
  }

  async updateSpaceChat(
    spaceId: string,
    chatId: string,
    userId: string,
    title: string,
  ) {
    const space = await this.prisma.space.findUnique({
      where: { id: spaceId },
      include: {
        spaceMembers: {
          where: { userId },
        },
      },
    });

    if (!space) {
      throw new NotFoundException('Space not found');
    }

    if (space.type !== 'PUBLIC' && space.spaceMembers.length === 0) {
      throw new ForbiddenException('You do not have access to this space');
    }

    const chat = await this.prisma.chat.findFirst({
      where: { id: chatId, spaceId },
    });

    if (!chat) {
      throw new NotFoundException('Space chat not found');
    }

    const updatedChat = await this.prisma.chat.update({
      where: { id: chatId },
      data: { title, updatedAt: new Date() },
      select: {
        id: true,
        title: true,
        spaceId: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      data: {
        chat: updatedChat,
      },
      message: `${updatedChat.title} updated successfully`,
    };
  }

  async deleteSpaceChat(spaceId: string, chatId: string, userId: string) {
    const space = await this.prisma.space.findUnique({
      where: { id: spaceId },
      include: {
        spaceMembers: {
          where: { userId },
        },
      },
    });

    if (!space) {
      throw new NotFoundException('Space not found');
    }

    const chat = await this.prisma.chat.findFirst({
      where: { id: chatId, spaceId },
    });

    if (!chat) {
      throw new NotFoundException('Space chat not found');
    }

    const userMember = space.spaceMembers[0];
    const isCreator = chat.userId === userId;
    const isAdmin = userMember?.role === 'ADMIN';

    if (!isCreator && !isAdmin) {
      throw new ForbiddenException(
        'Only the chat creator or space admin can delete this space chat',
      );
    }

    const deletedChat = await this.prisma.chat.delete({
      where: { id: chatId },
      select: {
        id: true,
        title: true,
      },
    });

    return {
      success: true,
      data: {
        chat: deletedChat,
      },
      message: `${deletedChat.title} deleted successfully`,
    };
  }
}
