import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SpaceType } from '@prisma/client';

export class UpdateSpaceDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(SpaceType)
  @IsOptional()
  type?: SpaceType;
}
