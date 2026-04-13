import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ResendModule } from 'nestjs-resend';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ResendModule.forRoot({
      apiKey: process.env.RESEND_API_KEY,
    }),
  ],

  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
