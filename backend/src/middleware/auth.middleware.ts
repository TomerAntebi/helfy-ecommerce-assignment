import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface AuthenticatedRequest extends Request {
  user?: { id: number; email: string };
}

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
