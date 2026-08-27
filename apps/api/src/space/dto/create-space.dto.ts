import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SpaceType } from '@prisma/client';

export class CreateSpaceDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(SpaceType)
  @IsNotEmpty()
  type!: SpaceType;
}
