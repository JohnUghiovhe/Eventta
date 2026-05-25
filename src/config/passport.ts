import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import User from '../models/User';
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

export default passport;
