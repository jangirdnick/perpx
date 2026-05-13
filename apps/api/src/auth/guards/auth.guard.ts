import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from '../types/jwt.type';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { User } from '@perpx/shared';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    try {
      // 🔐 verify token
      const decoded = this.jwtService.verify<JwtPayload>(token);

      const cached = await this.redis.getObject<User>(`user:${decoded.sub}`);
      if (cached) {
        request.user = cached;
        return true;
      }

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
        select: {
          id: true,
          fullname: true,
          username: true,
          avatar: true,
          email: true,
          emailVerified: true,
          role: true,
          subscription: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      await this.redis.setObject(`user:${user.id}`, user, 900);

      request.user = user;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
