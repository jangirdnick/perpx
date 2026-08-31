import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { RegisterUserDto } from '../auth/dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findByEmailOrUsername(email: string, username: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        password: true,
        fullname: true,
        role: true,
        subscription: true,
      },
    });

    return user;
  }

  async createUser(createDto: RegisterUserDto) {
    const user = await this.prisma.user.create({
      data: {
        ...createDto,
      },
      select: {
        id: true,
        fullname: true,
        username: true,
        email: true,
      },
    });

    return user;
  }

  async updateUser(userId: string, updateDto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { ...updateDto },
      select: {
        id: true,
        fullname: true,
        username: true,
        email: true,
        emailVerified: true,
        avatar: true,
        role: true,
        subscription: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await this.redis.setObject(`user:${userId}`, user, 900);
    return user;
  }

  async deleteUser(userId: string) {
    await this.redis.del(`user:${userId}`);
    const user = await this.prisma.user.delete({
      where: { id: userId },
    });
    return user;
  }
}
