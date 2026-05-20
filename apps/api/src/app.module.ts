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
import { ApiModule } from './api/api.module';
import { ChatService } from './chat/chat.service';
import { ChatModule } from './chat/chat.module';
import { MessageModule } from './message/message.module';
import { UploadService } from './upload/upload.service';
import { UploadModule } from './upload/upload.module';
import { VectorService } from './vector/vector.service';
import { VectorModule } from './vector/vector.module';

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
    ChatModule,
    MessageModule,
    ApiModule,
    UploadModule,
    VectorModule,
  ],
  controllers: [AppController],
  providers: [ChatGateway, ChatService, UploadService, VectorService],
})
export class AppModule {}
