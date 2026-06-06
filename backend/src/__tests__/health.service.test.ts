import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

vi.mock('../config/db', () => ({
  pool: { query: vi.fn() },
}));

import { pool } from '../config/db';
import { checkHealth } from '../modules/health/health.service';

const mockQuery = pool.query as unknown as Mock;

describe('health.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true when the DB responds to SELECT 1', async () => {
    mockQuery.mockResolvedValueOnce([[{ 1: 1 }]]);

    const result = await checkHealth();

    expect(result).toBe(true);
    expect(mockQuery).toHaveBeenCalledWith('SELECT 1');
  });

  it('propagates the error when the DB query fails', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB connection refused'));

    await expect(checkHealth()).rejects.toThrow('DB connection refused');
  });
});
