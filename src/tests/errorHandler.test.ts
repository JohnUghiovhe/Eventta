import { Response } from 'express';
import { AppError, errorHandler } from '../middleware/errorHandler';

const createResponse = (): Pick<Response, 'status' | 'json'> => {
  const response = {} as Response;
  response.status = jest.fn().mockReturnValue(response);
  response.json = jest.fn().mockReturnValue(response);
  return response;
};

describe('errorHandler', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    jest.restoreAllMocks();
  });

  it('returns operational errors without wrapping them', () => {
    const response = createResponse();

    errorHandler(new AppError(400, 'Bad request'), {} as any, response as Response, {} as any);

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

    errorHandler(new Error('Unexpected failure'), {} as any, response as Response, {} as any);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      message: 'Internal Server Error',
      error: 'Unexpected failure',
      details: undefined
    });
  });
});