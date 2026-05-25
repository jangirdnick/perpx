import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ResendService } from 'nestjs-resend';
import { getVerificationTemplate } from './templates/verification.template';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly resendService: ResendService,
    private readonly configService: ConfigService,
  ) {}

  async sendVerificationEmail(email: string, token: string) {
    if (!email || !token) {
      throw new NotFoundException('Email & Token not found');
    }

    const baseUrl =
      this.configService.get<string>('API_URL') || process.env.BACKEND_API_URL;
    const verificationLink = `${baseUrl}/api/auth/verify-email?token=${token}`;

    const html = getVerificationTemplate(verificationLink);

    try {
      const { data, error } = await this.resendService.emails.send({
        from: 'PerpX <no-reply@nickdstudio.online>',
        to: email,
        subject: 'Verify your email for PerpX',
        html,
      });

      if (error) {
        this.logger.error('[Resend Error]:', error);
        throw new Error(error.message);
      }

      this.logger.log(`Verification Email sent to ${email} (ID: ${data?.id})`);
      return data;
    } catch (err: unknown) {
      this.logger.error('[Email Service Crash]:', err);
      throw new InternalServerErrorException(
        (err as Error).message || 'Failed to send verification email',
      );
    }
  }
}
