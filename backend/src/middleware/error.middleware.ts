import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: err.message });
    return;
  }

  // Non-AppError: programmer error or unexpected exception.
  // Return a generic message — do not leak internal details to clients.
  res.status(500).json({ success: false, error: 'Internal server error' });
};
