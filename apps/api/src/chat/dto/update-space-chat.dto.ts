import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdateSpaceChatDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  title!: string;
}
