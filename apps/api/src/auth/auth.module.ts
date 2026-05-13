import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { EmailModule } from '../email/email.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard } from './guards/auth.guard';
import { RedisModule } from '../redis/redis.module';
import { WsAuthGuard } from './guards/ws-auth.guard';

@Module({
  imports: [
    UserModule,
    EmailModule,
    PrismaModule,
    RedisModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, WsAuthGuard],
  exports: [AuthService, AuthGuard, WsAuthGuard],
})
export class AuthModule {}
