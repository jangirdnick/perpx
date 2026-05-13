import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../types/jwt.type';
import { Socket } from 'socket.io';

interface AuthenticatedSocket extends Socket {
  data: {
    user?: JwtPayload;
    userId?: string;
  };
}

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<AuthenticatedSocket>();
    // const token = client.handshake.auth?.token as string;
    const token =
      (client.handshake.auth?.token as string | undefined) ??
      (client.handshake.query?.token as string | undefined) ??
      client.handshake.headers.authorization?.replace(/^Bearer\s+/i, '');

    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    try {
      const payload = this.authService.verifyToken(token) as JwtPayload;
      if (!payload || !payload.sub) {
        throw new UnauthorizedException('Invalid token');
      }

      // Attach user to client data
      client.data.user = payload;
      client.data.userId = payload.sub;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
