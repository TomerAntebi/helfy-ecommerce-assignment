import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../../middleware/auth.middleware';
import * as cartController from './cart.controller';

const router = Router();

// All cart routes require authentication
router.get('/', authenticate, cartController.getCart);

router.post(
  '/items',
  authenticate,
  [
    body('product_id').isInt().withMessage('Product ID must be an integer'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  cartController.addItem
);

router.put(
  '/items/:id',
  authenticate,
  [
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  ],
  cartController.updateItem
);

router.delete('/items/:id', authenticate, cartController.removeItem);

router.delete('/', authenticate, cartController.clearCart);

export default router;
