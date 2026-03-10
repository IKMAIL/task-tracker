import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

interface AppError extends Error {
  status?: number;
  code?: string;
}

export const errorHandler = (err: AppError, req: Request, res: Response, _next: NextFunction): void => {
  const status = err.status || 500;
  if (status >= 500) {
    logger.error(err.message, { stack: err.stack, path: req.path });
  }
  res.status(status).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      ...(err.code ? { code: err.code } : {}),
    },
  });
};
