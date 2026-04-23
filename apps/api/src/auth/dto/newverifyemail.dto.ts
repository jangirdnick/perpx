import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class NewVerifyEmailDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }: { value: string }) => value?.trim().toLowerCase())
  email!: string;
}
