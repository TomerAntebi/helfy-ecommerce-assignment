import { Router } from 'express';
import * as productsController from './products.controller';

const router = Router();

// IMPORTANT: /categories must be registered BEFORE /:id
// Otherwise "categories" will be interpreted as an ID parameter
router.get('/categories', productsController.getCategories);

router.get('/', productsController.getProducts);

router.get('/:id', productsController.getProductById);

export default router;
