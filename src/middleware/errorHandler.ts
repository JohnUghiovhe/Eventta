import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';
import { buildErrorResponse } from '../utils/errors';
import { SYSTEM_MESSAGES } from '../utils/systemMessages';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  Logger.error('Error occurred:', err);

  const normalized = buildErrorResponse(err);

  res.status(normalized.statusCode).json({
    success: false,
    message: normalized.body.message,
    error: process.env.NODE_ENV === 'development' ? normalized.body.error || SYSTEM_MESSAGES.responses.internalServerError : undefined,
    details: normalized.body.details
  });
};
