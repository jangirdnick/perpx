import { IsString } from 'class-validator';

export class SendMessageDto {
  @IsString()
  message!: string;

  @IsString()
  chatId?: string;

  @IsString()
  feature?: 'normal' | 'web_search' | 'file_rag';

  @IsString()
  model?: 'gemini' | 'mistral';
}
