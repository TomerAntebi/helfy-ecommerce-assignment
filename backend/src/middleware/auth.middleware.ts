import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface AuthenticatedRequest extends Request {
  user?: { id: number; email: string };
}

// Returns req.user with a required type, throwing if authenticate somehow
// did not populate it (defensive guard that also satisfies TypeScript).
export const requireUser = (
  req: AuthenticatedRequest
): { id: number; email: string } => {
  if (!req.user) {
    // This branch is unreachable in practice: authenticate has already
    // sent a 401 and not called next() when user is absent.
    throw new Error('Unauthenticated request reached authenticated handler');
  }
  return req.user;
};

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  // slice(7) is safer than split(' ')[1] — handles "Bearer  token" edge case
  const token = authHeader.slice(7);

  if (!token) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as {
      id: number;
      email: string;
    };
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};
