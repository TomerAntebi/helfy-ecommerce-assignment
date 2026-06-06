import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, requireUser } from '../../middleware/auth.middleware';
import * as checkoutService from './checkout.service';

export const validateCart = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id: userId } = requireUser(req);
    const result = await checkoutService.validateCart(userId, req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
