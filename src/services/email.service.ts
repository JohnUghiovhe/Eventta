import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';
import { Logger } from '../utils/logger';
import dotenv from 'dotenv';
import { SYSTEM_MESSAGES } from '../utils/systemMessages';

dotenv.config();

const resolveTemplateDir = () => {
  const rootTemplates = path.resolve(process.cwd(), 'src', 'templates');
  const prodTemplates = path.resolve(process.cwd(), 'dist', 'templates');
  return process.env.NODE_ENV === 'production' ? prodTemplates : rootTemplates;
};

const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '465', 10); 
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = (process.env.EMAIL_PASSWORD || '').replace(/\s+/g, '');

// Configure handlebars for email templates
const handlebarOptions: any = {
  viewEngine: {
    extName: '.hbs',
    partialsDir: resolveTemplateDir(),
    defaultLayout: false
  },
  viewPath: resolveTemplateDir(),
  extName: '.hbs'
};

const createTransporter = (port: number, secure: boolean) => {
  const transportConfig: any = {
    host: EMAIL_HOST,
    port,
    secure,
    requireTLS: true,
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 250,
    rateLimit: 5,
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 15000,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  };

  const transporter = nodemailer.createTransport(transportConfig);

  transporter.use('compile', hbs(handlebarOptions));
  return transporter;
};

const transporters = [createTransporter(EMAIL_PORT, EMAIL_PORT === 465)];

if (EMAIL_PORT !== 465) {
  transporters.push(createTransporter(465, true));
}

export interface EmailOptions {
  to: string;
  subject: string;
  template?: string;
  context?: any;
  html?: string;
  attachments?: any[];
}

export class EmailService {
  /**
   * Validate email configuration
   */
  static validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!EMAIL_USER) {
      errors.push('EMAIL_USER is not set');
    }

    if (!EMAIL_PASSWORD) {
      errors.push('EMAIL_PASSWORD is not set');
    }

    if (!EMAIL_HOST) {
      errors.push('EMAIL_HOST is not set');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Test SMTP connection
   */
  static async testConnection(): Promise<boolean> {
    try {
      const config = this.validateConfig();
      if (!config.valid) {
        Logger.error('Email configuration invalid:', config.errors);
        return false;
      }

      for (let index = 0; index < transporters.length; index++) {
        const transporter = transporters[index];
        try {
          await transporter.verify();
          Logger.info(`SMTP connection verified on transport ${index + 1}`);
          return true;
        } catch (error) {
          Logger.warn(
            `SMTP verification failed on transport ${index + 1} (${EMAIL_HOST}:${index === 0 ? EMAIL_PORT : 465})`
          );
        }
      }

      Logger.error('All SMTP connections failed verification');
      return false;
    } catch (error) {
      Logger.error('Email configuration test failed:', error);
      return false;
    }
  }

  /**
   * Send an email
   */
  static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const config = this.validateConfig();
      if (!config.valid) {
        Logger.error('Email configuration invalid:', config.errors);
        return false;
      }

      const mailOptions: any = {
        from: `${SYSTEM_MESSAGES.appName} <${EMAIL_USER}>`,
        to: options.to,
        subject: options.subject
      };

      if (options.template) {
        mailOptions.template = options.template;
        mailOptions.context = options.context;
      } else if (options.html) {
        mailOptions.html = options.html;
      }

      if (options.attachments) {
        mailOptions.attachments = options.attachments;
      }

      let lastError: any = null;

      for (let index = 0; index < transporters.length; index++) {
        const transporter = transporters[index];
        const port = index === 0 ? EMAIL_PORT : 465;
        try {
          await transporter.sendMail(mailOptions);
          Logger.info(`Email sent to ${options.to} via transport ${index + 1}`);
          return true;
        } catch (error: unknown) {
          const err = error as any;
          lastError = err;
          Logger.warn(
            `Email send attempt ${index + 1}/${transporters.length} failed on ${EMAIL_HOST}:${port} - ${err?.message || 'Unknown error'}`
          );
        }
      }

      Logger.error(`Email sending failed for ${options.to} after all SMTP attempts:`, (lastError as any)?.message || lastError);
      return false;
    } catch (error) {
      Logger.error('Email sending failed:', error);
      return false;
    }
  }

  /**
   * Send welcome email
   */
  static async sendWelcomeEmail(to: string, name: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: SYSTEM_MESSAGES.email.welcomeSubject,
      html: `
        <h1>Welcome to ${SYSTEM_MESSAGES.appName}, ${name}!</h1>
        <p>Thank you for joining ${SYSTEM_MESSAGES.appName}. We're excited to have you on board.</p>
        <p>Start exploring amazing events and create unforgettable memories!</p>
      `
    });
  }

  /**
   * Send verification email
   */
  static async sendVerificationEmail(to: string, name: string, verificationUrl: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: SYSTEM_MESSAGES.email.verificationSubject,
      html: `
        <h1>Verify your email, ${name}!</h1>
        <p>Thanks for signing up for ${SYSTEM_MESSAGES.appName}. Please confirm your email address to activate your account.</p>
        <p><a href="${verificationUrl}">Verify your email address</a></p>
        <p>If the button does not work, copy and paste this link into your browser:</p>
        <p>${verificationUrl}</p>
        <p>This verification link expires in 24 hours.</p>
      `
    });
  }

// Send password reset email
  static async sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: SYSTEM_MESSAGES.email.resetPasswordSubject,
      html: `
        <h1>Password Reset Request</h1>
        <p>We received a request to reset your password.</p>
        <p>Click the link below to set a new password:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link expires in 1 hour.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
      `
    });
  }

  /**
   * Send ticket purchase confirmation
   */
  static async sendTicketConfirmation(
    to: string,
    ticketData: {
      eventTitle: string;
      ticketNumber: string;
      eventDate: string;
      venue: string;
      qrCode: string;
      ticketId?: string;
      eventDescription?: string;
      eventCategory?: string;
      ticketPrice?: number;
      organizerName?: string;
    }
  ): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || SYSTEM_MESSAGES.defaultFrontendUrl;
    const ticketViewUrl = ticketData.ticketId 
      ? `${frontendUrl}/tickets/${ticketData.ticketId}`
      : `${frontendUrl}/my-tickets`;

    await this.sendEmail({
      to,
      subject: `🎉 Ticket ${(ticketData.ticketPrice ?? 0) === 0 ? 'Claimed' : 'Purchase'} Confirmed - ${ticketData.eventTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #f43f5e 50%, #38bdf8 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { padding: 30px 20px; background: #f9fafb; }
            .success-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin: 10px 0; font-size: 14px; font-weight: 600; }
            .ticket-details { background: white; border-radius: 12px; padding: 24px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { font-weight: 600; color: #6b7280; }
            .detail-value { color: #111827; text-align: right; }
            .ticket-number { font-family: 'Courier New', monospace; font-weight: bold; color: #f43f5e; font-size: 18px; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #f59e0b, #f43f5e); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; transition: opacity 0.3s; }
            .cta-button:hover { opacity: 0.9; }
            .info-box { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            .footer a { color: #f43f5e; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Ticket ${(ticketData.ticketPrice ?? 0) === 0 ? 'Claimed!' : 'Confirmed!'}</h1>
              <div class="success-badge">✓ ${(ticketData.ticketPrice ?? 0) === 0 ? 'Free Ticket Claimed' : 'Purchase Successful'}</div>
            </div>
            
            <div class="content">
              <p style="font-size: 16px; margin-bottom: 24px;">
                Congratulations! Your ticket ${(ticketData.ticketPrice ?? 0) === 0 ? 'for' : 'purchase for'} <strong>${ticketData.eventTitle}</strong> has been confirmed.
              </p>

              <div class="ticket-details">
                <h2 style="margin-top: 0; color: #111827; font-size: 20px;">🎫 Your Ticket Details</h2>
                
                <div class="detail-row">
                  <span class="detail-label">Ticket Number:</span>
                  <span class="ticket-number">${ticketData.ticketNumber}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Amount Paid:</span>
                  <span class="detail-value">${(ticketData.ticketPrice ?? 0) === 0 ? '<strong style="color: #10b981; font-size: 18px;">FREE</strong>' : '₦' + (ticketData.ticketPrice ?? 0).toLocaleString()}</span>
                </div>
              </div>

              <div class="ticket-details">
                <h2 style="margin-top: 0; color: #111827; font-size: 20px;">📅 Event Information</h2>
                
                <div class="detail-row">
                  <span class="detail-label">Event Name:</span>
                  <span class="detail-value"><strong>${ticketData.eventTitle}</strong></span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Date & Time:</span>
                  <span class="detail-value">${ticketData.eventDate}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Venue:</span>
                  <span class="detail-value">${ticketData.venue}</span>
                </div>
                
                ${ticketData.eventCategory ? `
                <div class="detail-row">
                  <span class="detail-label">Category:</span>
                  <span class="detail-value">${ticketData.eventCategory}</span>
                </div>
                ` : ''}
                
                ${ticketData.organizerName ? `
                <div class="detail-row">
                  <span class="detail-label">Organized by:</span>
                  <span class="detail-value">${ticketData.organizerName}</span>
                </div>
                ` : ''}
                
                ${ticketData.eventDescription ? `
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                  <p class="detail-label" style="margin: 0 0 8px 0;">About this event:</p>
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">${ticketData.eventDescription}</p>
                </div>
                ` : ''}
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${ticketViewUrl}" class="cta-button">
                  📱 View My Ticket
                </a>
              </div>

              <div class="info-box">
                <strong>📲 QR Code Attached</strong><br>
                Your ticket QR code is attached to this email. Please present it at the event entrance for scanning. You can also access it anytime by clicking the button above.
              </div>

              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <strong>⏰ Important Reminders</strong>
                <ul style="margin: 8px 0; padding-left: 20px;">
                  <li>Save this email or screenshot your QR code</li>
                  <li>Arrive early to avoid queues</li>
                  <li>Bring a valid ID for verification</li>
                  <li>Check event updates on your dashboard</li>
                </ul>
              </div>

              <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                Need help? Visit your <a href="${frontendUrl}/my-tickets" style="color: #f43f5e;">My Tickets</a> page or contact the event organizer.
              </p>
            </div>

            <div class="footer">
              <p><strong>${SYSTEM_MESSAGES.email.confirmationFooter}</strong></p>
              <p>
                <a href="${frontendUrl}">Home</a> · 
                <a href="${frontendUrl}/events">Browse Events</a> · 
                <a href="${frontendUrl}/my-tickets">My Tickets</a>
              </p>
              <p style="font-size: 12px; color: #9ca3af; margin-top: 16px;">
                This is an automated confirmation email. Please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: 'ticket-qr-code.png',
          path: ticketData.qrCode,
          cid: SYSTEM_MESSAGES.email.qrCodeCid
        }
      ]
    });
  }

// Send event reminder
  static async sendEventReminder(
    to: string,
    reminderData: {
      eventTitle: string;
      eventDate: string;
      venue: string;
      ticketNumber: string;
    }
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: `Reminder: ${reminderData.eventTitle}`,
      html: `
        <h1>Event Reminder</h1>
        <p>This is a reminder for your upcoming event: <strong>${reminderData.eventTitle}</strong></p>
        <p><strong>Date:</strong> ${reminderData.eventDate}</p>
        <p><strong>Venue:</strong> ${reminderData.venue}</p>
        <p><strong>Your Ticket Number:</strong> ${reminderData.ticketNumber}</p>
        <p>Don't forget to bring your ticket QR code!</p>
      `
    });
  }

  /**
   * Send payment confirmation
   */
  static async sendPaymentConfirmation(
    to: string,
    paymentData: {
      reference: string;
      amount: number;
      eventTitle: string;
    }
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Payment Confirmation',
      html: `
        <h1>Payment Successful</h1>
        <p>Your payment has been confirmed.</p>
        <p><strong>Reference:</strong> ${paymentData.reference}</p>
        <p><strong>Amount:</strong> ₦${paymentData.amount.toLocaleString()}</p>
        <p><strong>Event:</strong> ${paymentData.eventTitle}</p>
        <p>Thank you for your purchase!</p>
      `
    });
  }
}

// At the bottom of your emailService.ts file:
export const transporter = transporters[0];
