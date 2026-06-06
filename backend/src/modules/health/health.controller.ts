import { Request, Response } from 'express';
import { checkHealth } from './health.service';

// Health check - flat response (no envelope) by design.
// Returns 503 when the DB is unreachable so load-balancers can route around it.
export const getHealth = async (_req: Request, res: Response): Promise<void> => {
  try {
    await checkHealth();
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', timestamp: new Date().toISOString() });
  }
};
