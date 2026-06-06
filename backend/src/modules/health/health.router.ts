import { Router, Request, Response } from 'express';
import { pool } from '../../config/db';

const router = Router();

// Health check endpoint - returns flat response (no envelope)
// This is the only permitted exception to the standard response envelope.
// Checks DB connectivity via SELECT 1. Returns 503 if DB is unreachable.
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', timestamp: new Date().toISOString() });
  }
});

export default router;
