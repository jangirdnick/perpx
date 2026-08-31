import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import type { Request } from 'express';
import { ChatService } from './chat.service';
import { UpdateSpaceChatDto } from './dto/update-space-chat.dto';

@Controller('chat')
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async getSidebarUserChats(@Req() req: Request) {
    return await this.chatService.getSidebarUserChats(req.user!.id);
  }

  @Delete('clear-all')
  async clearAllChats(@Req() req: Request) {
    return await this.chatService.deleteAllUserChats(req.user!.id);
  }

  @Get('history/infinite')
  async getHistoryChats(@Req() req: Request) {
    const cursor = req.query.cursor as string | undefined;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 20;
    return await this.chatService.getHistoryChats(req.user!.id, cursor, limit);
  }

  @Get('space/:spaceId')
  async getSpaceChats(@Param('spaceId') spaceId: string, @Req() req: Request) {
    return await this.chatService.getSpaceChats(spaceId, req.user!.id);
  }

  @Get('space/:spaceId/infinite')
  async getSpaceChatsInfinite(
    @Param('spaceId') spaceId: string,
    @Req() req: Request,
  ) {
    const cursor = req.query.cursor as string | undefined;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 20;
    return await this.chatService.getSpaceChatsInfinite(
      spaceId,
      req.user!.id,
      cursor,
      limit,
    );
  }

  @Patch('space/:spaceId/:chatId')
  async updateSpaceChat(
    @Param('spaceId') spaceId: string,
    @Param('chatId') chatId: string,
    @Body() dto: UpdateSpaceChatDto,
    @Req() req: Request,
  ) {
    return await this.chatService.updateSpaceChat(
      spaceId,
      chatId,
      req.user!.id,
      dto.title,
    );
  }

  @Delete('space/:spaceId/:chatId')
  async deleteSpaceChat(
    @Param('spaceId') spaceId: string,
    @Param('chatId') chatId: string,
    @Req() req: Request,
  ) {
    return await this.chatService.deleteSpaceChat(
      spaceId,
      chatId,
      req.user!.id,
    );
  }

  @Get(':chatId')
  async getChatById(@Param('chatId') chatId: string, @Req() req: Request) {
    return await this.chatService.findById(chatId, req.user!.id);
  }

  @Post('rename/:chatId')
  async renameChat(
    @Param('chatId') chatId: string,
    @Body() body: { title: string },
    @Req() req: Request,
  ) {
    return await this.chatService.updateTitle(chatId, body.title, req.user!.id);
  }

  @Delete('delete/:chatId')
  async deleteChat(@Param('chatId') chatId: string, @Req() req: Request) {
    return await this.chatService.deleteChat(chatId, req.user!.id);
  }
}
