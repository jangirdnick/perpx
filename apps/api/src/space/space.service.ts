import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import { SpaceMemberRole } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

@Injectable()
export class SpaceService {
  constructor(private readonly prisma: PrismaService) {}

  async createSpace(userId: string, createSpaceDto: CreateSpaceDto) {
    try {
      const space = await this.prisma.space.create({
        data: {
          title: createSpaceDto.title,
          description: createSpaceDto.description || '',
          type: createSpaceDto.type,
          spaceMembers: {
            create: {
              userId: userId,
              role: SpaceMemberRole.ADMIN,
            },
          },
        },
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          createdAt: true,
          updatedAt: true,
          spaceMembers: {
            select: {
              id: true,
              role: true,
              userId: true,
            },
          },
        },
      });

      return {
        success: true,
        data: {
          space,
        },
        message: 'Space created successfully',
      };
    } catch (error: unknown) {
      const err = error as PrismaClientKnownRequestError;

      if (err.code === 'P2002') {
        throw new BadRequestException('Space already exists');
      }

      throw new InternalServerErrorException('Failed to create space');
    }
  }

  async getUserSpaces(userId: string, cursor?: string, limit: number = 20) {
    const spaces = await this.prisma.space.findMany({
      where: {
        spaceMembers: {
          some: {
            userId,
          },
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        createdAt: true,
        updatedAt: true,
        spaceMembers: {
          select: {
            id: true,
            role: true,
            userId: true,
          },
        },
      },
      take: limit + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        updatedAt: 'desc',
      },
    });

    let nextCursor: string | null = null;
    if (spaces.length > limit) {
      spaces.pop();
      nextCursor = spaces[spaces.length - 1].id;
    }

    return {
      success: true,
      data: {
        spaces,
        nextCursor,
      },
      message: 'Spaces retrieved successfully',
    };
  }

  async getSpaceById(spaceId: string, userId: string) {
    const spaceExists = await this.prisma.space.findUnique({
      where: { id: spaceId },
      select: { id: true },
    });

    if (!spaceExists) {
      throw new NotFoundException('Space not found');
    }

    const space = await this.prisma.space.findFirst({
      where: {
        id: spaceId,
        spaceMembers: {
          some: {
            userId,
          },
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        createdAt: true,
        updatedAt: true,
        spaceMembers: {
          select: {
            id: true,
            role: true,
            userId: true,
            user: {
              select: {
                id: true,
                fullname: true,
                username: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            chats: true,
            spaceMembers: true,
          },
        },
      },
    });

    if (!space) {
      throw new ForbiddenException('You do not have access to this space');
    }

    return {
      success: true,
      data: {
        space,
      },
      message: 'Space retrieved successfully',
    };
  }

  async deleteSpace(spaceId: string, userId: string) {
    const space = await this.prisma.space.findUnique({
      where: { id: spaceId },
      select: {
        id: true,
        spaceMembers: {
          where: { userId },
          select: { role: true },
        },
      },
    });

    if (!space) {
      throw new NotFoundException('Space not found');
    }

    const member = space.spaceMembers[0];
    if (!member || member.role !== SpaceMemberRole.ADMIN) {
      throw new ForbiddenException('Only space admins can delete this space');
    }

    await this.prisma.space.delete({
      where: { id: spaceId },
    });

    return {
      success: true,
      message: 'Space deleted successfully',
    };
  }
}
