import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import type { Request } from 'express';
import { ChatService } from './chat.service';

@Controller('chat')
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async getSidebarUserChats(@Req() req: Request) {
    return await this.chatService.getSidebarUserChats(req.user!.id);
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
