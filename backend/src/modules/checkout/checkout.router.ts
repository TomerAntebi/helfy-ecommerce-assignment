import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../../middleware/auth.middleware';
import * as checkoutController from './checkout.controller';

const router = Router();

router.post(
  '/validate',
  authenticate,
  [
    body('cart_item_ids').isArray().withMessage('cart_item_ids must be an array'),
  ],
  checkoutController.validateCart
);

export default router;
