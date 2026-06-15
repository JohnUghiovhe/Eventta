import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';
import { AuthProvider, UserRole } from '../types';
import { Logger } from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Local Strategy for login
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email: string, password: string, done) => {
      try {
        Logger.info('LocalStrategy authenticating:', { email });
        
        const user = await User.findOne({ email });
        if (!user) {
          Logger.warn('User not found:', { email });
          return done(null, false, { message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          Logger.warn('Password mismatch:', { email });
          return done(null, false, { message: 'Invalid credentials' });
        }

        Logger.info('LocalStrategy authentication successful:', { email });
        return done(null, { 
          id: user._id.toString(), 
          email: user.email, 
          role: user.role
        });
      } catch (error) {
        Logger.error('LocalStrategy error:', error);
        return done(error);
      }
    }
  )
);

// JWT Strategy for protected routes
const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload: { id?: string; userId?: string }, done) => {
    try {
      const userId = payload.id || payload.userId;
      if (!userId) {
        Logger.warn('JWT payload missing user ID:', { payload });
        return done(null, false);
      }
      
      const user = await User.findById(userId);
      if (user) {
        return done(null, { 
          id: user._id.toString(), 
          email: user.email, 
          role: user.role 
        });
      }
      Logger.warn('User not found for token:', { userId });
      return done(null, false);
    } catch (error) {
      Logger.error('JWT Strategy error:', error);
      return done(error, false);
    }
  })
);

// Google OAuth Strategy
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  if (!GOOGLE_CALLBACK_URL) {
    Logger.warn('⚠️  GOOGLE_CALLBACK_URL is not set. Google OAuth will use a default callback URL. Set this in .env for your environment.');
  }
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('Google account has no email'), undefined);
          }

          let user = await User.findOne({ email });

          if (user) {
            user.googleId = profile.id;
            user.isEmailVerified = true;
            if (profile.photos?.[0]?.value && !user.profileImage) {
              user.profileImage = profile.photos[0].value;
            }
            await user.save();
          } else {
            const nameParts = (profile.displayName || email.split('@')[0]).split(' ');
            user = await User.create({
              email,
              authProvider: AuthProvider.GOOGLE,
              googleId: profile.id,
              isEmailVerified: true,
              firstName: profile.name?.givenName || nameParts[0] || 'Google',
              lastName: profile.name?.familyName || nameParts.slice(1).join(' ') || 'User',
              role: UserRole.EVENTEE,
              profileImage: profile.photos?.[0]?.value
            });
          }

          return done(null, {
            id: user._id.toString(),
            email: user.email,
            role: user.role
          });
        } catch (error) {
          Logger.error('Google Strategy error:', error);
          return done(error, undefined);
        }
      }
    )
  );
  Logger.info('✓ Google OAuth strategy configured');
} else {
  Logger.warn('⚠️  Google OAuth not configured (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET missing)');
}

export default passport;
