import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import * as cartService from './cart.service';

export const getCart = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await cartService.getCart(req.user!.id);
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, error: errors.array()[0].msg });
    return;
  }

  try {
    const { product_id, quantity } = req.body;
    const item = await cartService.addItem(req.user!.id, product_id, quantity);
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, error: errors.array()[0].msg });
    return;
  }

  try {
    const itemId = Number(req.params.id);
    const { quantity } = req.body;
    const item = await cartService.updateItem(req.user!.id, itemId, quantity);
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
    const itemId = Number(req.params.id);
    await cartService.removeItem(req.user!.id, itemId);
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
    await cartService.clearCart(req.user!.id);
    res.status(200).json({ success: true, data: { success: true } });
  } catch (error) {
    next(error);
  }
};
