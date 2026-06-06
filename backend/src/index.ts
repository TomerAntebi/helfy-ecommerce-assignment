// env.ts must be the first import: it calls dotenv.config() before any other
// module reads process.env. In Docker, variables are already in the environment
// and this is a no-op. In local dev it loads the .env file.
import { config } from './config/env';
import express from 'express';
import cors from 'cors';
import authRouter from './modules/auth/auth.router';
import usersRouter from './modules/users/users.router';
import productsRouter from './modules/products/products.router';
import cartRouter from './modules/cart/cart.router';
import ordersRouter from './modules/orders/orders.router';
import checkoutRouter from './modules/checkout/checkout.router';
import healthRouter from './modules/health/health.router';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();
const PORT = config.PORT;

// Middleware
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/health', healthRouter);

// Global error handler (must be last)
app.use(errorMiddleware);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
