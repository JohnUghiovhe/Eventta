import { Response, NextFunction } from 'express';
import passport from 'passport';
import { AuthRequest, UserRole } from '../types';

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  passport.authenticate('jwt', { session: false }, (err: unknown, user: Express.User | false | null) => {
    if (err) {
      res.status(500).json({ success: false, message: 'Authentication error' });
      return;
    }
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    req.user = user;
    next();
  })(req, res, next);
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      const requiredRoles = roles.join(' or ');
      const errorMessage = 
        roles.includes(UserRole.EVENTEE) 
          ? 'You must be an Eventee to purchase tickets. Please register as an Eventee (Attend Events) account.'
          : roles.includes(UserRole.CREATOR)
          ? 'You must be a Creator to access this feature. Please register as a Creator (Create Events) account.'
          : `Insufficient permissions. Required role(s): ${requiredRoles}`;
      
      res.status(403).json({
        success: false,
        message: errorMessage,
        requiredRoles,
        currentRole: req.user.role
      });
      return;
    }

    next();
  };
};

export const isCreator = authorize(UserRole.CREATOR);
export const isEventee = authorize(UserRole.EVENTEE);
export const isCreatorOrEventee = authorize(UserRole.CREATOR, UserRole.EVENTEE);
