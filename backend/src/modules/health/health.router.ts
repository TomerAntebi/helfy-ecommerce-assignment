import { Router, Request, Response } from 'express';

const router = Router();

// Health check endpoint - returns flat response (no envelope)
// This is the only permitted exception to the standard response envelope
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;
