import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '@task-tracker/utils';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  // Allow inter-service calls via X-Service-Token
  const serviceToken = req.headers['x-service-token'] as string | undefined;
  if (serviceToken && serviceToken === process.env.SERVICE_TOKEN) {
    logger.debug('auth: service token accepted', { method: req.method, path: req.path });
    next();
    return;
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    logger.warn('auth: missing token', { method: req.method, path: req.path });
    res.status(401).json({ success: false, error: { message: 'No token provided' } });
    return;
  }
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET as string) as Request['user'];
    logger.debug('auth: token verified', { method: req.method, path: req.path, sub: req.user?.sub, role: req.user?.role, teamId: req.user?.teamId });
    next();
  } catch (err) {
    logger.warn('auth: invalid token', { method: req.method, path: req.path, error: (err as Error).message });
    res.status(401).json({ success: false, error: { message: 'Invalid or expired token' } });
  }
};
