import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

/**
 * Email Service
 * 
 * Handles sending emails using nodemailer
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  private getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      // Validate SMTP configuration
      if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        this.logger.warn('SMTP credentials not configured. Email sending will fail.');
        // Create a dummy transporter that will fail gracefully
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER || 'dummy',
            pass: process.env.SMTP_PASSWORD || 'dummy',
          },
        });
      } else {
        // Create transporter based on environment variables
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        });
      }
    }
    return this.transporter;
  }

  /**
   * Send verification code email
   */
  async sendVerificationCode(email: string, code: string, name: string): Promise<void> {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'کد تأیید ثبت نام - Classified Ads',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #333; text-align: center; margin-bottom: 30px;">کد تأیید ثبت نام</h1>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              سلام ${name || 'کاربر عزیز'}،
            </p>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              برای تکمیل ثبت نام در سایت Classified Ads، لطفاً کد زیر را در صفحه تأیید وارد کنید:
            </p>
            <div style="background-color: #f8f9fa; border: 2px dashed #dee2e6; padding: 20px; text-align: center; margin: 30px 0; border-radius: 5px;">
              <span style="font-size: 32px; font-weight: bold; color: #dc3545; letter-spacing: 8px; font-family: 'Courier New', monospace;">${code}</span>
            </div>
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              این کد تا ۳ دقیقه دیگر معتبر است.
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              اگر شما این ایمیل را درخواست نکرده‌اید، لطفاً آن را نادیده بگیرید.
            </p>
          </div>
        </div>
      `,
      text: `
کد تأیید ثبت نام

سلام ${name || 'کاربر عزیز'}،

برای تکمیل ثبت نام در سایت Classified Ads، لطفاً کد زیر را در صفحه تأیید وارد کنید:

${code}

این کد تا ۳ دقیقه دیگر معتبر است.

اگر شما این ایمیل را درخواست نکرده‌اید، لطفاً آن را نادیده بگیرید.
      `,
    };

    try {
      const transporter = this.getTransporter();
      await transporter.sendMail(mailOptions);
      this.logger.log(`Verification code sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification code to ${email}`, error);
      throw new Error('Failed to send verification email');
    }
  }
}

