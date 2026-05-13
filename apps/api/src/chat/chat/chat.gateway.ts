import { Injectable, Logger, UseGuards } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { WsAuthGuard } from '../../auth/guards/ws-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../../auth/types/jwt.type';
import { SendMessageDto } from '../dto/sendmessage.dto';
import { ChatService } from '../chat.service';
import { MessageService } from '../../message/message.service';
import { ApiService } from '../../api/api.service';

interface AuthenticatedSocket extends Socket {
  data: {
    user?: JwtPayload;
    userId?: string;
  };
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/chat',
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly jwtService: JwtService,
    private readonly aiService: ApiService,
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
  ) {}
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server!: Server;

  afterInit() {
    this.logger.log('Chat gateway initialized');
  }

  handleConnection(client: AuthenticatedSocket) {
    try {
      // const token = client.handshake.auth?.token as string;
      const token =
        (client.handshake.auth?.token as string | undefined) ??
        (client.handshake.query?.token as string | undefined) ??
        client.handshake.headers.authorization?.replace(/^Bearer\s+/i, '');
      if (!token) return client.disconnect();
      const payload: JwtPayload = this.jwtService.verify(token);
      client.data = { user: payload, userId: payload.sub };
      client.emit('connected', { userId: payload.sub });
      this.logger.log(`Client ${client.id} connected - user ${payload.sub}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('sendMessage')
  async handleMessage(client: AuthenticatedSocket, payload: SendMessageDto) {
    const userId = client.data.userId;

    if (!userId) {
      client.emit('streamError', { message: 'Unauthorized' });
      return;
    }

    try {
      const chat = payload.chatId
        ? await this.chatService.findById(payload.chatId, userId)
        : await this.chatService.createChat(userId);

      const humanMessage = await this.messageService.saveMessage({
        chatId: chat.data.chat.id,
        userId,
        message: payload.message,
        role: 'HUMAN',
      });

      client.emit('humanMessage', { humanMessage });

      await this.aiService.streamNormalResponse(
        [{ role: 'user', content: payload.message }],
        'gemini',
        (token) => {
          client.emit('streamMessage', { token, chatId: chat.data.chat.id });
        },
        (full) => {
          void this.handleAiResponse(
            client,
            chat.data.chat.id,
            userId,
            payload,
            full,
          );
        },
      );
    } catch (err) {
      this.logger.error(err);
      client.emit('streamError', { message: 'Something went wrong' });
    }
  }

  private async handleAiResponse(
    client: AuthenticatedSocket,
    chatId: string,
    userId: string,
    payload: SendMessageDto,
    full: string,
  ) {
    const message = await this.messageService.saveMessage({
      chatId,
      userId,
      message: full,
      role: 'AI',
    });

    client.emit('streamEnd', { message });

    if (!payload.chatId) {
      const title = await this.aiService.generateTitle(
        payload.message,
        'mistral',
      );
      await this.chatService.updateTitle(chatId, title, userId);
      client.emit('titleGenerated', { title, chatId });
    }
  }
}
