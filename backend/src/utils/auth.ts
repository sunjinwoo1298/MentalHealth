import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export class AuthUtils {
  private static jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';
  private static jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  private static get jwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      if (process.env.NODE_ENV === 'development') {
        // Generate a temporary secret in development to avoid crashes.
        const temp = crypto.randomBytes(32).toString('hex');
        // eslint-disable-next-line no-console
        console.warn('⚠️  JWT_SECRET is not set. Using a temporary development secret. Set JWT_SECRET in your environment for persistent tokens.');
        return temp;
      }
      throw new Error('JWT_SECRET environment variable is not set');
    }
    return secret;
  }

  private static get jwtRefreshSecret(): string {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      if (process.env.NODE_ENV === 'development') {
        const temp = crypto.randomBytes(32).toString('hex');
        // eslint-disable-next-line no-console
        console.warn('⚠️  JWT_REFRESH_SECRET is not set. Using a temporary development refresh secret. Set JWT_REFRESH_SECRET in your environment for persistent refresh tokens.');
        return temp;
      }
      throw new Error('JWT_REFRESH_SECRET environment variable is not set');
    }
    return secret;
  }

  // Hash password
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Verify password
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Generate JWT token
  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    } as jwt.SignOptions);
  }

  // Generate refresh token
  static generateRefreshToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.jwtRefreshSecret, {
      expiresIn: this.jwtRefreshExpiresIn,
    } as jwt.SignOptions);
  }

  // Verify JWT token
  static verifyToken(token: string): JWTPayload {
    return jwt.verify(token, this.jwtSecret) as JWTPayload;
  }

  // Verify refresh token
  static verifyRefreshToken(token: string): JWTPayload {
    return jwt.verify(token, this.jwtRefreshSecret) as JWTPayload;
  }

  // Generate verification token
  static generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generate password reset token
  static generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Extract token from Authorization header
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}