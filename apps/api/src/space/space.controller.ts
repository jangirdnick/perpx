import {
  Body,
  Controller,
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
    return await this.spaceService.getUserSpaces(req.user!.id);
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
}
