import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { EmailService } from '../services/email.service';
import { SYSTEM_MESSAGES } from '../utils/systemMessages';

const startTime = Date.now();

export class HealthController {
  static getHealth(_req: Request, res: Response): void {
    const dbState = mongoose.connection.readyState;
    const dbStatus: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    const emailConfig = EmailService.validateConfig();

    res.status(200).json({
      success: true,
      message: SYSTEM_MESSAGES.apiRunning,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime) / 1000),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: {
          status: dbStatus[dbState] || 'unknown',
          connected: dbState === 1,
        },
        email: {
          configured: emailConfig.valid,
          errors: emailConfig.valid ? [] : emailConfig.errors,
        },
      },
    });
  }

  static async getEmailHealth(_req: Request, res: Response): Promise<void> {
    const emailConfig = EmailService.validateConfig();

    if (!emailConfig.valid) {
      res.status(200).json({
        success: false,
        status: 'misconfigured',
        message: 'Email service is not properly configured.',
        config: {
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.EMAIL_PORT || '587', 10),
          userSet: !!process.env.EMAIL_USER,
          passwordSet: !!process.env.EMAIL_PASSWORD,
        },
        errors: emailConfig.errors,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    try {
      const connected = await EmailService.testConnection();
      res.status(200).json({
        success: connected,
        status: connected ? 'healthy' : 'unhealthy',
        message: connected
          ? 'Email service is connected and ready to send messages.'
          : 'Email service configuration is valid but SMTP connection failed.',
        config: {
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.EMAIL_PORT || '587', 10),
          userSet: true,
          passwordSet: true,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(200).json({
        success: false,
        status: 'error',
        message: 'Email service connection failed.',
        error: error.message || 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
