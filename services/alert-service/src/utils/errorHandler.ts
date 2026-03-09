import { Request, Response, NextFunction } from 'express';

interface HttpError extends Error {
  status?: number;
}

const errorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction): void => {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ success: false, error: { message: err.message || 'Internal Server Error' } });
};

export default errorHandler;
