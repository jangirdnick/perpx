import { Controller, Delete, Get, Param, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import type { Request } from 'express';
import { MessageService } from './message.service';

@Controller('message')
@UseGuards(AuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get(':chatId')
  getChatMessages(@Param('chatId') id: string, @Req() req: Request) {
    console.warn('message get');
    return this.messageService.getChatMessages(id, req.user!.id);
  }

  @Delete('delete/:chatId')
  deleteMessage(@Param('chatId') id: string, @Req() req: Request) {
    return this.messageService.deleteMessage(id, req.user!.id);
  }
}
