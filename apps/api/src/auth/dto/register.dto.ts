import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  IsStrongPassword,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @Transform(({ value }: { value: string }) => value?.trim())
  @MinLength(4, { message: 'Full name must be at least 2 characters' })
  @MaxLength(50, { message: 'Full name must not exceed 50 characters' })
  fullname!: string;

  @IsString()
  @Transform(({ value }: { value: string }) => value?.trim())
  @MinLength(3, { message: 'Username must be at least 3 characters' })
  @MaxLength(20, { message: 'Username must not excced 20 characters' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'Username can only contain letters, numbers, underscores, and hyphens',
  })
  username!: string;

  @IsEmail({}, { message: 'Please provide a valid email addres' })
  @Transform(({ value }: { value: string }) => value?.trim().toLowerCase())
  email!: string;

  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must be 8+ chars with uppercase, lowercase, number, and symbol',
    },
  )
  password!: string;
}
