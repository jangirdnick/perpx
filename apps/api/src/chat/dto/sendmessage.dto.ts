import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class AttachmentDto {
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsString()
  type!: string;

  @IsString()
  name!: string;
}

export class SendMessageDto {
  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  chatId?: string;

  @IsOptional()
  @IsBoolean()
  webSearch?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];
}
