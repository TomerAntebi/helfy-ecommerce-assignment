import { Request, Response, NextFunction } from 'express';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err);
  
  const status = (err as { statusCode?: number }).statusCode ?? 500;
  res.status(status).json({ success: false, error: err.message });
};
