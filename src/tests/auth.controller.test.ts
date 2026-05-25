import crypto from 'crypto';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Request, Response } from 'express';
import { AuthController } from '../controllers/auth.controller';
import User from '../models/User';
import { EmailService } from '../services/email.service';
import { SYSTEM_MESSAGES } from '../utils/systemMessages';

jest.mock('../models/User', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn()
  }
}));

jest.mock('../services/email.service', () => ({
  EmailService: {
    sendPasswordResetEmail: jest.fn()
  }
}));

const mockedUserModel = User as unknown as {
  findOne: ReturnType<typeof jest.fn>;
};

const mockedEmailService = EmailService as unknown as {
  sendPasswordResetEmail: ReturnType<typeof jest.fn>;
};

const createMockRes = () => {
  const res: Record<string, unknown> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as unknown as Pick<Response, 'status' | 'json'>;
};

describe('AuthController forgot/reset password flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('forgotPassword should return generic success for unknown email', async () => {
    mockedUserModel.findOne.mockResolvedValueOnce(null);

    const req = { body: { email: 'missing@example.com' } } as unknown as Request;
    const res = createMockRes();

    await AuthController.forgotPassword(req, res as unknown as Response);

    expect(mockedUserModel.findOne).toHaveBeenCalledWith({ email: 'missing@example.com' });
    expect(mockedEmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: SYSTEM_MESSAGES.auth.passwordResetLinkSent
    });
  });

  it('forgotPassword should save token and return success when email sends', async () => {
    const save = jest.fn(async () => {});
    const userDoc: {
      email: string;
      save: ReturnType<typeof jest.fn>;
      passwordResetToken?: string;
      passwordResetExpires?: Date;
    } = {
      email: 'user@example.com',
      save,
      passwordResetToken: undefined,
      passwordResetExpires: undefined
    };

    mockedUserModel.findOne.mockResolvedValueOnce(userDoc);
    mockedEmailService.sendPasswordResetEmail.mockResolvedValueOnce(true);

    const req = { body: { email: 'user@example.com' } } as unknown as Request;
    const res = createMockRes();

    await AuthController.forgotPassword(req, res as unknown as Response);

    expect(save).toHaveBeenCalledTimes(1);
    expect(mockedEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
      'user@example.com',
      expect.stringContaining('/reset-password?token=')
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: SYSTEM_MESSAGES.auth.passwordResetLinkSent
    });
  });

  it('resetPassword should reset password for valid token', async () => {
    const save = jest.fn(async () => {});
    const userDoc: {
      password: string;
      passwordResetToken?: string;
      passwordResetExpires?: Date;
      save: ReturnType<typeof jest.fn>;
    } = {
      password: 'old-password',
      passwordResetToken: 'token-hash',
      passwordResetExpires: new Date(Date.now() + 5 * 60 * 1000),
      save
    };

    mockedUserModel.findOne.mockResolvedValueOnce(userDoc);

    const req = { body: { token: 'valid-token', password: 'new-password-123' } } as unknown as Request;
    const res = createMockRes();

    await AuthController.resetPassword(req, res as unknown as Response);

    const hashedToken = crypto.createHash('sha256').update('valid-token').digest('hex');
    expect(mockedUserModel.findOne).toHaveBeenCalledWith({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: expect.any(Date) }
    });
    expect(userDoc.password).toBe('new-password-123');
    expect(userDoc.passwordResetToken).toBeUndefined();
    expect(userDoc.passwordResetExpires).toBeUndefined();
    expect(save).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: SYSTEM_MESSAGES.auth.passwordResetSuccessful
    });
  });

  it('resetPassword should reject invalid token', async () => {
    mockedUserModel.findOne.mockResolvedValueOnce(null);

    const req = { body: { token: 'invalid-token', password: 'new-password-123' } } as unknown as Request;
    const res = createMockRes();

    await AuthController.resetPassword(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: SYSTEM_MESSAGES.auth.invalidResetToken
    });
  });

  it('resetPassword should reject expired token', async () => {
    mockedUserModel.findOne.mockResolvedValueOnce(null);

    const req = { body: { token: 'expired-token', password: 'new-password-123' } } as unknown as Request;
    const res = createMockRes();

    await AuthController.resetPassword(req, res as unknown as Response);

    expect(mockedUserModel.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        passwordResetExpires: { $gt: expect.any(Date) }
      })
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: SYSTEM_MESSAGES.auth.invalidResetToken
    });
  });
});
