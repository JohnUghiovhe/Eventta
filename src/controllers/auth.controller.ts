import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import { EmailService } from '../services/email.service';
import { sanitizeUser } from '../utils/helpers';
import { Logger } from '../utils/logger';
import { AuthRequest } from '../types';
import { AppError } from '../utils/errors';
import { SYSTEM_MESSAGES } from '../utils/systemMessages';
import dotenv from 'dotenv';
import passport from 'passport';

dotenv.config();

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key';
const FRONTEND_URL: string = process.env.FRONTEND_URL || 'http://localhost:5173';
const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Unknown error';

export class AuthController {
//  Register a new user
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, role, phoneNumber } = req.body;
      const normalizedEmail = String(email || '').trim().toLowerCase();

      // Check if user already exists
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: SYSTEM_MESSAGES.auth.userExists
        });
        return;
      }

      const verificationToken = crypto.randomBytes(32).toString('hex');
      const hashedVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
      const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Create new user
      const user = await User.create({
        email: normalizedEmail,
        password,
        firstName,
        lastName,
        role,
        phoneNumber,
        isEmailVerified: false,
        emailVerificationToken: hashedVerificationToken,
        emailVerificationExpires: verificationExpiry
      });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

      const verificationEmailSent = await EmailService.sendVerificationEmail(user.email, firstName, verificationUrl);
      if (!verificationEmailSent) {
        await User.findByIdAndDelete(user._id);
        res.status(500).json({
          success: false,
          message: SYSTEM_MESSAGES.auth.verificationEmailFailed
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: SYSTEM_MESSAGES.auth.registrationSuccess,
        data: {
          user: sanitizeUser(user),
          verificationRequired: true
        }
      });
    } catch (error: unknown) {
      Logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: SYSTEM_MESSAGES.auth.registrationFailed,
        error: getErrorMessage(error)
      });
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response): Promise<void> {
    Logger.info('Login attempt:', { email: req.body.email });
    
    return new Promise<void>((resolve) => {
      passport.authenticate('local', { session: false }, async (
        err: unknown,
        user: Express.User | false | null,
        info: { message?: string } | undefined
      ) => {
        if (err) {
          Logger.error('Login error:', err);
          res.status(500).json({
            success: false,
            message: SYSTEM_MESSAGES.auth.loginFailed
          });
          return resolve();
        }

        if (!user) {
          Logger.warn('Login failed - invalid credentials:', { email: req.body.email });
          res.status(401).json({
            success: false,
            message: info?.message || SYSTEM_MESSAGES.auth.invalidCredentials
          });
          return resolve();
        }

        // Fetch full user document from database
        try {
          const fullUser = await User.findById(user.id);
          if (!fullUser) {
            Logger.error('User document not found after authentication');
            res.status(500).json({
              success: false,
              message: SYSTEM_MESSAGES.auth.loginFailed
            });
            return resolve();
          }

          if (!fullUser.isEmailVerified) {
            res.status(403).json({
              success: false,
              message: SYSTEM_MESSAGES.auth.loginPendingVerification
            });
            return resolve();
          }

          // Generate JWT token
          const token = jwt.sign(
            { id: fullUser._id.toString(), email: fullUser.email, role: fullUser.role },
            JWT_SECRET as jwt.Secret,
            { expiresIn: '7d' }
          );

          Logger.info('Login successful:', { email: fullUser.email, id: fullUser._id });
          res.status(200).json({
            success: true,
            message: SYSTEM_MESSAGES.auth.loginSuccessful,
            data: {
              user: sanitizeUser(fullUser),
              token
            }
          });
        } catch (error) {
          Logger.error('Error fetching user after authentication:', error);
          res.status(500).json({
            success: false,
            message: SYSTEM_MESSAGES.auth.loginFailed
          });
        }
        resolve();
      })(req, res);
    });
  }

// Google OAuth callback
  static googleCallback(req: Request, res: Response): void {
    passport.authenticate('google', { session: false, failWithError: true }, (err: unknown, user: Express.User | false | null) => {
      if (err || !user) {
        Logger.error('Google authentication failed:', err);
        res.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
        return;
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET as jwt.Secret,
        { expiresIn: '7d' }
      );

      res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
    })(req, res);
  }

// Request password reset
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      const normalizedEmail = String(email || '').trim().toLowerCase();
      const user = await User.findOne({ email: normalizedEmail });

      if (!user) {
        res.status(200).json({
          success: true,
          message: SYSTEM_MESSAGES.auth.passwordResetLinkSent
        });
        return;
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      user.passwordResetToken = hashedResetToken;
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

      const emailSent = await EmailService.sendPasswordResetEmail(user.email, resetUrl);

      if (!emailSent) {
        Logger.warn(`Password reset email failed to send for user ${user.email}. Rolling back reset token.`);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.status(500).json({
          success: false,
          message: SYSTEM_MESSAGES.auth.passwordResetProcessFailed
        });
        return;
      }

      Logger.info(`Password reset email sent successfully to ${user.email}`);

      res.status(200).json({
        success: true,
        message: SYSTEM_MESSAGES.auth.passwordResetLinkSent
      });
    } catch (error: unknown) {
      Logger.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: SYSTEM_MESSAGES.auth.passwordResetProcessFailed
      });
    }
  }

// Reset password using token
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = req.body;

      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: new Date() }
      });

      if (!user) {
        res.status(400).json({
          success: false,
          message: SYSTEM_MESSAGES.auth.invalidResetToken
        });
        return;
      }

      user.password = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      res.status(200).json({
        success: true,
        message: SYSTEM_MESSAGES.auth.passwordResetSuccessful
      });
    } catch (error: unknown) {
      Logger.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: SYSTEM_MESSAGES.auth.passwordResetFailed
      });
    }
  }

  /**
   * Verify email address using token
   */
  static async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = String(req.body.token || req.query.token || '').trim();

      if (!token) {
        next(new AppError(400, SYSTEM_MESSAGES.auth.verificationTokenRequired));
        return;
      }

      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: new Date() }
      });

      if (!user) {
        next(new AppError(400, SYSTEM_MESSAGES.auth.verificationLinkInvalid));
        return;
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      res.status(200).json({
        success: true,
        message: SYSTEM_MESSAGES.auth.verificationSuccess,
        data: {
          user: sanitizeUser(user)
        }
      });
    } catch (error) {
      Logger.error('Verify email error:', error);
      next(new AppError(500, SYSTEM_MESSAGES.responses.internalServerError));
    }
  }

// Get current user profile
  static async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: SYSTEM_MESSAGES.auth.profileNotAuthenticated
        });
        return;
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        res.status(404).json({
          success: false,
          message: SYSTEM_MESSAGES.auth.profileNotFound
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: sanitizeUser(user)
      });
    } catch (error: unknown) {
      Logger.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: SYSTEM_MESSAGES.auth.profileFetchFailed
      });
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: SYSTEM_MESSAGES.auth.profileNotAuthenticated
        });
        return;
      }

      const { firstName, lastName, phoneNumber, profileImage } = req.body;

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { firstName, lastName, phoneNumber, profileImage },
        { new: true, runValidators: true }
      );

      if (!user) {
        res.status(404).json({
          success: false,
          message: SYSTEM_MESSAGES.auth.profileNotFound
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: SYSTEM_MESSAGES.auth.profileUpdateSuccess,
        data: sanitizeUser(user)
      });
    } catch (error: unknown) {
      Logger.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: SYSTEM_MESSAGES.auth.profileUpdateFailed
      });
    }
  }
}
