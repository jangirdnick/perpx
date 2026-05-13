import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MessageController } from './message.controller';
import { ChatModule } from '../chat/chat.module';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [PrismaModule, ChatModule, AuthModule, RedisModule],
  providers: [MessageService],
  exports: [MessageService],
  controllers: [MessageController],
})
export class MessageModule {}
