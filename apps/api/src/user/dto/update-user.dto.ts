import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value?: string }) => value?.trim())
  @MinLength(4, { message: 'Full name must be at least 4 characters' })
  @MaxLength(50, { message: 'Full name must not exceed 50 characters' })
  fullname?: string;
}
