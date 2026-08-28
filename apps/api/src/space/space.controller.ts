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
import { SpaceService } from './space.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import type { Request } from 'express';

@Controller('space')
@UseGuards(AuthGuard)
export class SpaceController {
  constructor(private readonly spaceService: SpaceService) {}

  @Get()
  async getUserSpaces(@Req() req: Request) {
    const cursor = req.query.cursor as string | undefined;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 20;
    return await this.spaceService.getUserSpaces(req.user!.id, cursor, limit);
  }

  @Get(':spaceId')
  async getSpaceById(@Param('spaceId') spaceId: string, @Req() req: Request) {
    return await this.spaceService.getSpaceById(spaceId, req.user!.id);
  }

  @Post()
  async createSpace(
    @Body() createSpaceDto: CreateSpaceDto,
    @Req() req: Request,
  ) {
    return await this.spaceService.createSpace(req.user!.id, createSpaceDto);
  }

  @Delete(':spaceId')
  async deleteSpace(@Param('spaceId') spaceId: string, @Req() req: Request) {
    return await this.spaceService.deleteSpace(spaceId, req.user!.id);
  }
}
