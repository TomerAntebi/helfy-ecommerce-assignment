import { Request, Response, NextFunction } from 'express';
import * as productsService from './products.service';

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search, category, min_price, max_price, page, limit } = req.query;

    const result = await productsService.getProducts({
      search: search as string | undefined,
      category: category as string | undefined,
      min_price: min_price ? Number(min_price) : undefined,
      max_price: max_price ? Number(max_price) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
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
  try {
    const productId = Number(req.params.id);
    const product = await productsService.getProductById(productId);
    res.status(200).json({ success: true, data: { product } });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (
  req: Request,
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
