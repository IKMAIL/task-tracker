import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  status?: number;
}

export default (err: AppError, req: Request, res: Response, _next: NextFunction): void => {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ success: false, error: { message: err.message || 'Internal Server Error' } });
};
