import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { errorMiddleware } from '../middleware/error.middleware';
import { AppError } from '../types';

const makeRes = () => {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  return { status, json: json as unknown } as unknown as Response & {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };
};

describe('errorMiddleware', () => {
  it('returns the AppError status code and message', () => {
    const res = makeRes();
    const err = new AppError('Email already in use', 409);

    errorMiddleware(
      err,
      {} as Request,
      res as unknown as Response,
      (() => undefined) as unknown as NextFunction
    );

    expect(res.status).toHaveBeenCalledWith(409);
    const jsonArg = res.status.mock.results[0].value as { json: ReturnType<typeof vi.fn> };
    expect(jsonArg.json).toHaveBeenCalledWith({ success: false, error: 'Email already in use' });
  });

  it('returns 500 with a generic message for unexpected errors', () => {
    const res = makeRes();
    const err = new Error('Some internal crash');

    errorMiddleware(
      err,
      {} as Request,
      res as unknown as Response,
      (() => undefined) as unknown as NextFunction
    );

    expect(res.status).toHaveBeenCalledWith(500);
    const jsonArg = res.status.mock.results[0].value as { json: ReturnType<typeof vi.fn> };
    expect(jsonArg.json).toHaveBeenCalledWith({
      success: false,
      error: 'Internal server error',
    });
  });
});
