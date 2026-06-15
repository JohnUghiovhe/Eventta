import { Request, Response } from 'express';
import mongoose from 'mongoose';
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
      },
    });
  }
}
