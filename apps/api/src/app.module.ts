import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { EmailModule } from './email/email.module';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from './redis/redis.module';
import { ChatGateway } from './chat/chat/chat.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECREET,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    EmailModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [ChatGateway],
})
export class AppModule {}
