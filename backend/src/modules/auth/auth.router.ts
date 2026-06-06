import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from './auth.controller';

const router = Router();

router.post(
  '/signup',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('first_name').notEmpty().trim().isLength({ max: 100 }).withMessage('First name is required and must be max 100 characters'),
    body('last_name').notEmpty().trim().isLength({ max: 100 }).withMessage('Last name is required and must be max 100 characters'),
  ],
  authController.signup
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  authController.login
);

export default router;
