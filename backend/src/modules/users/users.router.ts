import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../../middleware/auth.middleware';
import * as usersController from './users.controller';

const router = Router();

router.get('/me', authenticate, usersController.getMe);

router.put(
  '/me',
  authenticate,
  [
    body('first_name').optional().isLength({ max: 100 }).withMessage('First name must be max 100 characters'),
    body('last_name').optional().isLength({ max: 100 }).withMessage('Last name must be max 100 characters'),
    body('phone').optional().isLength({ max: 30 }).withMessage('Phone must be max 30 characters'),
    body('address').optional().isLength({ max: 500 }).withMessage('Address must be max 500 characters'),
  ],
  usersController.updateMe
);

export default router;
