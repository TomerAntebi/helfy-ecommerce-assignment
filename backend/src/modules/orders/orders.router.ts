import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../../middleware/auth.middleware';
import * as ordersController from './orders.controller';

const router = Router();

// All order routes require authentication
router.get('/', authenticate, ordersController.getOrders);

router.get(
  '/:id',
  authenticate,
  param('id').isInt({ min: 1 }).withMessage('Order ID must be a positive integer'),
  ordersController.getOrderById
);

router.post(
  '/',
  authenticate,
  [
    body('shipping_full_name').notEmpty().isLength({ max: 200 }).withMessage('Shipping full name is required and must be max 200 characters'),
    body('shipping_street').notEmpty().isLength({ max: 255 }).withMessage('Shipping street is required and must be max 255 characters'),
    body('shipping_city').notEmpty().isLength({ max: 100 }).withMessage('Shipping city is required and must be max 100 characters'),
    body('shipping_state').notEmpty().isLength({ max: 100 }).withMessage('Shipping state is required and must be max 100 characters'),
    body('shipping_zip_code').notEmpty().isLength({ max: 20 }).withMessage('Shipping zip code is required and must be max 20 characters'),
    body('shipping_country').notEmpty().isLength({ max: 100 }).withMessage('Shipping country is required and must be max 100 characters'),
    body('payment_method').isIn(['credit_card', 'paypal', 'bank_transfer']).withMessage('Payment method must be credit_card, paypal, or bank_transfer'),
    body('payment_last_four')
      .if(body('payment_method').equals('credit_card'))
      .notEmpty()
      .matches(/^\d{4}$/)
      .withMessage('Last four digits must be exactly 4 numeric characters'),
  ],
  ordersController.createOrder
);

export default router;
