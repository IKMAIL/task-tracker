import { Request, Response, NextFunction } from 'express';
import { logger } from '@task-tracker/utils';

interface HttpError extends Error {
  status?: number;
}

const errorHandler = (err: HttpError, req: Request, res: Response, _next: NextFunction): void => {
  const status = err.status || 500;
  if (status >= 500) {
    logger.error(err.message, { stack: err.stack, method: req.method, path: req.path, status });
  } else {
    logger.warn(err.message, { method: req.method, path: req.path, status });
  }
  res.status(status).json({ success: false, error: { message: err.message || 'Internal Server Error' } });
};

export default errorHandler;
