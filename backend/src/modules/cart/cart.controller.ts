import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, requireUser } from '../../middleware/auth.middleware';
import * as cartService from './cart.service';

export const getCart = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id: userId } = requireUser(req);
    const result = await cartService.getCart(userId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const addItem = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id: userId } = requireUser(req);
    const { product_id, quantity } = req.body;
    const item = await cartService.addItem(userId, product_id, quantity);
    res.status(201).json({ success: true, data: { item } });
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id: userId } = requireUser(req);
    const itemId = Number(req.params.id);
    const { quantity } = req.body;
    const item = await cartService.updateItem(userId, itemId, quantity);
    if (item === null) {
      res.status(200).json({ success: true, data: { success: true } });
      return;
    }
    res.status(200).json({ success: true, data: { item } });
  } catch (error) {
    next(error);
  }
};

export const removeItem = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id: userId } = requireUser(req);
    const itemId = Number(req.params.id);
    await cartService.removeItem(userId, itemId);
    res.status(200).json({ success: true, data: { success: true } });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id: userId } = requireUser(req);
    await cartService.clearCart(userId);
    res.status(200).json({ success: true, data: { success: true } });
  } catch (error) {
    next(error);
  }
};
