import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, requireUser } from '../../middleware/auth.middleware';
import * as usersService from './users.service';

export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id: userId } = requireUser(req);
    const user = await usersService.getUserById(userId);
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id: userId } = requireUser(req);
    const user = await usersService.updateUser(userId, req.body);
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};
