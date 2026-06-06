import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import * as productsService from './products.service';

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, error: errors.array()[0].msg });
    return;
  }

  try {
    const { search, category, min_price, max_price, page, limit } = req.query;

    const result = await productsService.getProducts({
      search: search as string | undefined,
      category: category as string | undefined,
      min_price: min_price !== undefined ? Number(min_price) : undefined,
      max_price: max_price !== undefined ? Number(max_price) : undefined,
      page: page !== undefined ? Number(page) : undefined,
      limit: limit !== undefined ? Number(limit) : undefined,
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, error: errors.array()[0].msg });
    return;
  }

  try {
    const productId = Number(req.params.id);
    const product = await productsService.getProductById(productId);
    res.status(200).json({ success: true, data: { product } });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await productsService.getCategories();
    res.status(200).json({ success: true, data: { categories } });
  } catch (error) {
    next(error);
  }
};
