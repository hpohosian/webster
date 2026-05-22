import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend = new Resend(process.env.RESEND_API_KEY);

  private async send(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.resend.emails.send({
        from: 'Webster <onboarding@resend.dev>',
        to,
        subject,
        html,
      });

      this.logger.log(`Email sent to ${to}`);
    } catch (err: any) {
      this.logger.warn(`Mail not sent to ${to}: ${err.message}`);
    }
  }

  async sendVerification(email: string, code: string) {
    await this.send(
      email,
      'Email confirmation',
      `<h2>Your verification code: ${code}</h2>`,
    );
  }

  async sendPasswordReset(email: string, link: string) {
    await this.send(
      email,
      'Password reset',
      `
        <p>You requested password reset.</p>
        <p>Link valid 15 minutes:</p>
        <a href="${link}">${link}</a>
      `,
    );
  }
}
