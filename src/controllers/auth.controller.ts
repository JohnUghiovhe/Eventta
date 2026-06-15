import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { sanitizeUser } from '../utils/helpers';
import { Logger } from '../utils/logger';
import { AuthRequest } from '../types';
import { SYSTEM_MESSAGES } from '../utils/systemMessages';
import dotenv from 'dotenv';
import passport from 'passport';

dotenv.config();

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key';
const FRONTEND_URL: string = process.env.FRONTEND_URL || 'http://localhost:3000';
const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Unknown error';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, role, phoneNumber } = req.body;
      const normalizedEmail = String(email || '').trim().toLowerCase();

      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: SYSTEM_MESSAGES.auth.userExists
        });
        return;
      }

      const user = await User.create({
        email: normalizedEmail,
        password,
        firstName,
        lastName,
        role,
        phoneNumber,
        isEmailVerified: true
      });

      const token = jwt.sign(
        { id: user._id.toString(), email: user.email, role: user.role },
        JWT_SECRET as jwt.Secret,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: SYSTEM_MESSAGES.auth.registrationSuccess,
        data: {
          user: sanitizeUser(user),
          token
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
