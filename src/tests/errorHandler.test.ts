import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { NextFunction, Request, Response } from 'express';
import { AppError, errorHandler } from '../middleware/errorHandler';

const createResponse = (): Pick<Response, 'status' | 'json'> => {
  const response: Record<string, unknown> = {};
  response.status = jest.fn().mockReturnValue(response) as unknown as Response['status'];
  response.json = jest.fn().mockReturnValue(response) as unknown as Response['json'];
  return response as Pick<Response, 'status' | 'json'>;
};

describe('errorHandler', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    jest.restoreAllMocks();
  });

  it('returns operational errors without wrapping them', () => {
    const response = createResponse();

    errorHandler(new AppError(400, 'Bad request'), {} as Request, response as Response, (() => undefined) as NextFunction);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      message: 'Bad request',
      error: undefined,
      details: undefined
    });
  });

  it('maps generic errors to the shared internal server message', () => {
    process.env.NODE_ENV = 'development';
    const response = createResponse();

    errorHandler(new Error('Unexpected failure'), {} as Request, response as Response, (() => undefined) as NextFunction);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      message: 'Internal Server Error',
      error: 'Unexpected failure',
      details: undefined
    });
  });
});