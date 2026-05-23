import { Request, Response, NextFunction } from 'express';
import { SYSTEM_MESSAGES } from './systemMessages';

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

export type NormalizedErrorResponse = {
  statusCode: number;
  body: {
    status: 'error';
    message: string;
    error?: string;
    details?: unknown;
  };
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return SYSTEM_MESSAGES.responses.internalServerError;
};

export const buildErrorResponse = (error: AppError | Error | unknown): NormalizedErrorResponse => {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      body: {
        status: 'error',
        message: error.message
      }
    };
  }

  if (error && typeof error === 'object') {
    const typedError = error as Record<string, any>;
    const errorName = typedError.name as string | undefined;

    if (errorName === 'ValidationError') {
      return {
        statusCode: 400,
        body: {
          status: 'error',
          message: SYSTEM_MESSAGES.responses.validationFailed,
          details: typedError.errors
        }
      };
    }

    if (errorName === 'CastError') {
      return {
        statusCode: 400,
        body: {
          status: 'error',
          message: SYSTEM_MESSAGES.responses.invalidRequest
        }
      };
    }

    if (errorName === 'JsonWebTokenError') {
      return {
        statusCode: 401,
        body: {
          status: 'error',
          message: SYSTEM_MESSAGES.responses.invalidToken
        }
      };
    }

    if (errorName === 'TokenExpiredError') {
      return {
        statusCode: 401,
        body: {
          status: 'error',
          message: SYSTEM_MESSAGES.responses.expiredToken
        }
      };
    }

    if (typedError.code === 11000) {
      return {
        statusCode: 409,
        body: {
          status: 'error',
          message: SYSTEM_MESSAGES.responses.duplicateResource
        }
      };
    }

    if (typeof typedError.statusCode === 'number' && typeof typedError.message === 'string') {
      return {
        statusCode: typedError.statusCode,
        body: {
          status: 'error',
          message: typedError.message
        }
      };
    }
  }

  return {
    statusCode: 500,
    body: {
      status: 'error',
      message: SYSTEM_MESSAGES.responses.internalServerError,
      error: process.env.NODE_ENV === 'development' ? getErrorMessage(error) : undefined
    }
  };
};

export const errorHandler = (
  error: AppError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const normalized = buildErrorResponse(error);
  res.status(normalized.statusCode).json(normalized.body);
};

export default { AppError, errorHandler };
