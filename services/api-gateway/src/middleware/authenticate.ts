import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '@task-tracker/utils';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    logger.warn('auth: missing token', { method: req.method, path: req.path });
    res.status(401).json({ success: false, error: { message: 'No token provided' } });
    return;
  }
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET!) as jwt.JwtPayload;
    logger.debug('auth: token verified', { method: req.method, path: req.path, sub: payload.sub, role: payload.role });
    (req as Request & { user: jwt.JwtPayload }).user = payload;
    next();
  } catch (err) {
    logger.warn('auth: invalid token', { method: req.method, path: req.path, error: (err as Error).message });
    res.status(401).json({ success: false, error: { message: 'Invalid or expired token' } });
  }
};
