import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../../middleware/auth.middleware';
import * as checkoutController from './checkout.controller';

const router = Router();

router.post(
  '/validate',
  authenticate,
  [
    body('cart_item_ids')
      .isArray({ min: 1 })
      .withMessage('cart_item_ids must be a non-empty array'),
    body('cart_item_ids.*')
      .isInt({ min: 1 })
      .withMessage('Each cart item ID must be a positive integer'),
  ],
  checkoutController.validateCart
);

export default router;
