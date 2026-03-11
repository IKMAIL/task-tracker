import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '@task-tracker/utils';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    logger.warn('auth: missing token', { method: req.method, path: req.path });
    res.status(401).json({ success: false, error: { message: 'No token provided' } });
    return;
  }
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET as string) as jwt.JwtPayload & {
      sub: string;
      email: string;
      role: string;
      teamId?: string;
    };
    logger.debug('auth: token verified', { method: req.method, path: req.path, sub: req.user.sub, role: req.user.role, teamId: req.user.teamId });
    next();
  } catch (err) {
    logger.warn('auth: invalid token', { method: req.method, path: req.path, error: (err as Error).message });
    res.status(401).json({ success: false, error: { message: 'Invalid or expired token' } });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'admin') {
    logger.warn('auth: admin required', { method: req.method, path: req.path, userId: req.user?.sub, role: req.user?.role });
    res.status(403).json({ success: false, error: { message: 'Admin access required' } });
    return;
  }
  next();
}
