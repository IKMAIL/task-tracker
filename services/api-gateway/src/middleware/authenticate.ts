import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../../../../shared/utils/src/logger';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    logger.warn('auth: missing token', { method: req.method, path: req.path });
    res.status(401).json({ success: false, error: { message: 'No token provided' } });
    return;
  }
  try {
    (req as Request & { user: jwt.JwtPayload }).user = jwt.verify(header.slice(7), process.env.JWT_SECRET!) as jwt.JwtPayload;
    next();
  } catch (err) {
    logger.warn('auth: invalid token', { method: req.method, path: req.path, error: (err as Error).message });
    res.status(401).json({ success: false, error: { message: 'Invalid or expired token' } });
  }
};
