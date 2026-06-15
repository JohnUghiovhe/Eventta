import { Router } from 'express';
import passport from 'passport';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import {
	validateRegistration,
	validateLogin
} from '../middleware/validation';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, validateRegistration, AuthController.register);

router.post('/login', authLimiter, validateLogin, AuthController.login);

router.get('/google', passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));

router.get('/google/callback', AuthController.googleCallback);

router.get('/profile', authenticate, AuthController.getProfile);

router.put('/profile', authenticate, AuthController.updateProfile);

export default router;
