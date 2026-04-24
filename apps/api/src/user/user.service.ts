import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserDto } from '../auth/dto/register.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

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
}
