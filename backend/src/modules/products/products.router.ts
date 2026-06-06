import { Router } from 'express';
import { query, param } from 'express-validator';
import { validateRequest } from '../../middleware/validate.middleware';
import * as productsController from './products.controller';

const router = Router();

// IMPORTANT: /categories must be registered BEFORE /:id
// Otherwise "categories" will be interpreted as an ID parameter
router.get('/categories', productsController.getCategories);

router.get(
  '/',
  [
    query('search').optional().isString().trim(),
    query('category').optional().isString().trim(),
    query('min_price').optional().isFloat({ min: 0 }).withMessage('min_price must be a non-negative number'),
    query('max_price').optional().isFloat({ min: 0 }).withMessage('max_price must be a non-negative number'),
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50'),
  ],
  validateRequest,
  productsController.getProducts
);

router.get(
  '/:id',
  param('id').isInt({ min: 1 }).withMessage('Product ID must be a positive integer'),
  validateRequest,
  productsController.getProductById
);

export default router;
