import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import type { Request } from 'express';
import { UploadService } from './upload.service';
import { UploadFileItemDto } from './dto/upload-files.dto';

@Controller('upload')
@UseGuards(AuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('upload-url')
  async getUploadUrl(
    @Body(new ValidationPipe()) body: UploadFileItemDto,
    @Req() req: Request,
  ) {
    const userId = req.user?.id;

    return this.uploadService.getPresignedUrl(
      body.fileName,
      body.fileType,
      userId!,
    );
  }
}
