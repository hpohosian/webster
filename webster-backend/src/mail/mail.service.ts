import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private async send(to: string, subject: string, html: string) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: { email: process.env.FROM_EMAIL, name: 'Webster' },
          to: [{ email: to }],
          subject,
          htmlContent: html,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        this.logger.warn(`Mail not sent to ${to}: ${err}`);
      }
    } catch (err) {
      this.logger.warn(`Mail not sent to ${to}: ${err.message}`);
    }
  }

  async sendVerification(email: string, verifyLink: string) {
    await this.send(
      email,
      'Email confirmation',
      `<h2>Verify your email</h2><a href="${verifyLink}">${verifyLink}</a>`,
    );
  }

  async sendPasswordReset(email: string, link: string) {
    await this.send(
      email,
      'Password reset',
      `<p>You requested password reset.</p>
       <p>Link valid 15 minutes:</p>
       <a href="${link}">${link}</a>`,
    );
  }
}
