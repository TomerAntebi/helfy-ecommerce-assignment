import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import * as cartController from './cart.controller';

const router = Router();

// All cart routes require authentication
router.get('/', authenticate, cartController.getCart);

router.post(
  '/items',
  authenticate,
  [
    body('product_id').isInt({ min: 1 }).withMessage('Product ID must be a positive integer'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  validateRequest,
  cartController.addItem
);

router.put(
  '/items/:id',
  authenticate,
  [
    param('id').isInt({ min: 1 }).withMessage('Item ID must be a positive integer'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  ],
  validateRequest,
  cartController.updateItem
);

router.delete(
  '/items/:id',
  authenticate,
  param('id').isInt({ min: 1 }).withMessage('Item ID must be a positive integer'),
  validateRequest,
  cartController.removeItem
);

router.delete('/', authenticate, cartController.clearCart);

export default router;
