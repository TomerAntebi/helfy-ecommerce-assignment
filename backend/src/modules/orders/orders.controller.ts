import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import * as ordersService from './orders.service';

export const createOrder = async (
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
    const order = await ordersService.createOrder(req.user!.id, req.body);
    res.status(201).json({ success: true, data: { order } });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orders = await ordersService.getOrders(req.user!.id);
    res.status(200).json({ success: true, data: { orders } });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (
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
    const orderId = Number(req.params.id);
    const result = await ordersService.getOrderById(req.user!.id, orderId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
