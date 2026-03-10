import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: { message: 'No token provided' } });
    return;
  }
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET as string) as Request['user'];
    next();
  } catch {
    res.status(401).json({ success: false, error: { message: 'Invalid or expired token' } });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ success: false, error: { message: 'Admin access required' } });
    return;
  }
  next();
};

export const requireServiceToken = (req: Request, res: Response, next: NextFunction): void => {
  if (req.headers['x-service-token'] !== process.env.SERVICE_TOKEN) {
    res.status(403).json({ success: false, error: { message: 'Invalid service token' } });
    return;
  }
  next();
};
