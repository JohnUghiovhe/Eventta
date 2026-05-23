import { Response } from 'express';
import { res } from '../utils/response';
import { SYSTEM_MESSAGES } from '../utils/systemMessages';

const createResponse = (): Pick<Response, 'status' | 'json'> => {
  const response = {} as Response;
  response.status = jest.fn().mockReturnValue(response);
  response.json = jest.fn().mockReturnValue(response);
  return response;
};

describe('response helper', () => {
  it('uses shared defaults for success responses', () => {
    const response = createResponse();

    res.ok(response as Response, 200, undefined, { id: 1 });

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      status: 'success',
      message: SYSTEM_MESSAGES.responses.success,
      data: { id: 1 }
    });
  });

  it('uses shared defaults for error responses', () => {
    const response = createResponse();

    res.notFound(response as Response);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({
      status: 'error',
      message: SYSTEM_MESSAGES.responses.notFound
    });
  });
});