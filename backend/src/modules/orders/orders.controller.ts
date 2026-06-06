import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, requireUser } from '../../middleware/auth.middleware';
import * as ordersService from './orders.service';

export const createOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id: userId } = requireUser(req);
    const order = await ordersService.createOrder(userId, req.body);
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
    const { id: userId } = requireUser(req);
    const orders = await ordersService.getOrders(userId);
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
  try {
    const { id: userId } = requireUser(req);
    const orderId = Number(req.params.id);
    const result = await ordersService.getOrderById(userId, orderId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
