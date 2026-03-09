import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
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
    next();
  } catch {
    res.status(401).json({ success: false, error: { message: 'Invalid or expired token' } });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ success: false, error: { message: 'Admin access required' } });
    return;
  }
  next();
}
