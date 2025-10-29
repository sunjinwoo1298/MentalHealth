import { Request } from 'express';

export interface AuthUser {
  userId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

import { RequestHandler } from 'express';

export type RequestWithAuth = Request & {
  user: AuthUser;
};

export type AuthenticatedRequestHandler<T = any> = RequestHandler<any, any, T>;