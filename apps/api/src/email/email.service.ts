import { Injectable, NotFoundException } from '@nestjs/common';
import { ResendService } from 'nestjs-resend';
import { renderTemplate } from '../utils/renderTemplate';

@Injectable()
export class EmailService {
  constructor(private readonly resendService: ResendService) {}

  async sendVerificationEmail(email: string, token: string) {
    if (!email || !token) {
      throw new NotFoundException('Email & Token not found');
    }

    const verificationLink = `http://localhost:3001/verify-email?token=${token}`;

    const html = renderTemplate('verification', {
      verificationLink,
    });

    const { data, error } = await this.resendService.emails.send({
      from: 'Perpx <onboarding@resend.dev>',
      to: email,
      subject: 'Verify email',
      html,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}
