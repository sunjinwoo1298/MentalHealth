import { Request, Response, NextFunction } from 'express';
import { AuthUtils, JWTPayload } from '../utils/auth';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = AuthUtils.extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required'
      });
      return;
    }

    const decoded = AuthUtils.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        res.status(401).json({
          success: false,
          message: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
        return;
      } else if (error.name === 'JsonWebTokenError') {
        res.status(401).json({
          success: false,
          message: 'Invalid token',
          code: 'INVALID_TOKEN'
        });
        return;
      }
    }
    
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};