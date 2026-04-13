import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { renderTemplate } from '../utils/renderTemplate';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor(private readonly configService: ConfigService) {
    const resendKey = this.configService.getOrThrow<string>('RESEND_API_KEY');
    this.resend = new Resend(resendKey);
  }

  async sendVerificationEmail(email: string, token: string): Promise<any> {
    if (!email || !token) {
      throw new NotFoundException('Email & token required');
    }

    const verificationLink = `http://localhost:3001/verify-email?token=${token}`;
    const html = renderTemplate('verification', {
      verificationLink,
    });

    const { data, error } = await this.resend.emails.send({
      from: 'Perpx <onboarding@resend.dev>',
      to: [email], // ✅ Array format (Resend requirement)
      subject: 'Verify your email',
      html,
    });

    if (error) throw new BadRequestException(`Email failed: ${error.message}`);

    return data;
  }
}
