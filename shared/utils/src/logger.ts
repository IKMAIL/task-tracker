import { Request, Response, NextFunction } from 'express';

const log = (level: string, message: string, meta: Record<string, unknown> = {}): void => {
  process.stdout.write(
    JSON.stringify({ timestamp: new Date().toISOString(), level, message, ...meta }) + '\n'
  );
};

export const logger = {
  info:  (msg: string, meta?: Record<string, unknown>) => log('info',  msg, meta),
  warn:  (msg: string, meta?: Record<string, unknown>) => log('warn',  msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log('error', msg, meta),
  debug: (msg: string, meta?: Record<string, unknown>) => log('debug', msg, meta),
};

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    log(level, 'http request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration_ms: duration,
      ...(req.user ? { userId: (req.user as { sub?: string }).sub } : {}),
    });
  });
  next();
};
