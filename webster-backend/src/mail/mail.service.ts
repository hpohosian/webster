import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    family: 4,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  private async send(options: nodemailer.SendMailOptions): Promise<void> {
    try {
      await this.transporter.sendMail(options);
    } catch (err) {
      // Log the error but never crash the caller —
      // a missing SMTP config in dev shouldn't break ticket purchase, registration, etc.
      this.logger.warn(`Mail not sent to ${options.to}: ${err.message}`);
    }
  }

  async sendVerification(email: string, code: string) {
    await this.send({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Email confirmation',
      text: `Your verification code: ${code}`,
      html: `<h2>Your verification code: ${code}</h2>`,
    });
  }

  async sendPasswordReset(email: string, link: string) {
    await this.send({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Password reset',
      html: `
        <p>You requested password reset.</p>
        <p>Link valid 15 minutes:</p>
        <a href="${link}">${link}</a>
      `,
    });
  }

  async sendEventNotification(email: string, title: string, message: string) {
    await this.send({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: title,
      html: `
        <h2>${title}</h2>
        <p>${message}</p>
      `,
    });
  }
}
