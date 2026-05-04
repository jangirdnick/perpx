import { Injectable, Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/chat',
  path: '/api/socket.io',
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server!: Server;

  afterInit() {
    this.logger.log('Chat gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client ${client.id} connected`);
  }

  handleDisconnect(client: Socket) {
    this.logger.warn(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: { message: string }) {
    this.logger.log(`Message: ${payload.message}`);

    this.server.emit('message', payload);
  }
}
