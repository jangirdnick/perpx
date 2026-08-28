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
import type { WebSource } from '@perpx/shared/types/message.type';
import type { SaveMessageResponse } from '../../message/types/message.type';
import type { ChatMessage } from '../../api/api.types';
import { VectorService } from '../../vector/vector.service';

interface AuthenticatedSocket extends Socket {
  data: {
    user?: JwtPayload;
    userId?: string;
  };
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.CLINT,
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
    private readonly vectorService: VectorService,
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
        : await this.chatService.createChat(userId, payload.spaceId);

      const pdfFile =
        payload.attachments?.filter(
          (attachmnt) =>
            typeof attachmnt.fileUrl === 'string' &&
            attachmnt.fileUrl.length > 0 &&
            attachmnt.type === 'application/pdf',
        ) ?? [];

      for (const file of pdfFile) {
        await this.vectorService.processAndStorePdf(
          file.fileUrl!,
          chat.data.chat.id,
          file.name,
        );
      }

      let sources: { url: string; title: string; snippet: string }[] = [];
      if (payload.attachments) {
        sources = payload.attachments
          .filter((attachment) => attachment.fileUrl)
          .map((attachment) => ({
            url: attachment.fileUrl!,
            title: attachment.name,
            snippet: attachment.type,
          }));
      }

      const humanMessage = await this.messageService.saveMessageWithSources({
        chatId: chat.data.chat.id,
        userId,
        message: payload.message,
        role: 'HUMAN',
        sources,
      });

      await this.chatService.updateTimestamp(chat.data.chat.id);

      client.emit('humanMessage', { humanMessage });

      const dbMessages = await this.messageService.getLastMessages(
        chat.data.chat.id,
        userId,
      );
      const chatHistory: ChatMessage[] = dbMessages.map((msg) => ({
        role: msg.role === 'AI' ? 'ai' : 'user',
        content: msg.message,
        attachments: (msg.sources || []).map(
          (source) =>
            ({
              fileUrl: source.url,
              type: source.snippet,
              name: source.title,
            }) as { fileUrl: string; type: string; name: string },
        ),
      }));

      chatHistory.push({
        role: 'user' as const,
        content: payload.message,
        attachments: (payload.attachments || []).map(
          (att) =>
            ({
              fileUrl: att.fileUrl || '',
              type: att.type,
              name: att.name,
            }) as { fileUrl: string; type: string; name: string },
        ),
      });

      const pdfContext = await this.vectorService.searchPdfChunks(
        payload.message,
        chat.data.chat.id,
      );

      const spaceContext = chat.data.chat.space?.description || undefined;

      if (payload.webSearch) {
        await this.aiService.streamWebSearchResponse(
          chatHistory,
          true,
          pdfContext,
          (token) => {
            client.emit('streamMessage', { token, chatId: chat.data.chat.id });
          },
          (full, sources) => {
            void this.handleAiResponse(
              client,
              chat.data.chat.id,
              userId,
              payload,
              full,
              sources,
            );
          },
          spaceContext,
        );
      } else {
        await this.aiService.streamNormalResponse(
          chatHistory,
          pdfContext,
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
          spaceContext,
        );
      }
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
    sources?: WebSource[],
  ) {
    let message: SaveMessageResponse;
    if (sources && sources.length > 0) {
      message = await this.messageService.saveMessageWithSources({
        chatId,
        userId,
        message: full,
        role: 'AI',
        sources,
      });
    } else {
      message = await this.messageService.saveMessage({
        chatId,
        userId,
        message: full,
        role: 'AI',
      });
    }

    if (!payload.chatId) {
      const title = await this.aiService.generateTitle(
        payload.message,
        'mistral',
      );
      if (payload.spaceId) {
        await this.chatService.updateSpaceChat(
          payload.spaceId,
          chatId,
          userId,
          title,
        );
      } else {
        await this.chatService.updateTitle(chatId, title, userId);
      }
      client.emit('titleGenerated', { title, chatId });
    }
    if (message?.id) {
      client.emit('streamEnd', { message });
    }
  }
}
