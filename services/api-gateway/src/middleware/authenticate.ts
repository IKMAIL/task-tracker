import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '@task-tracker/utils';

const IDENTITY_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:3001';

// Maps route prefix + HTTP methods to the required API key permission.
// JWT (browser) users bypass this — only API keys are checked.
const PERMISSION_MAP: Array<{ prefix: RegExp; methods: string[]; permission: string }> = [
  { prefix: /^\/api\/tasks/,             methods: ['GET'],                      permission: 'tasks:read'    },
  { prefix: /^\/api\/tasks/,             methods: ['POST', 'PUT', 'DELETE'],    permission: 'tasks:write'   },
  { prefix: /^\/api\/progress/,          methods: ['GET'],                      permission: 'progress:read' },
  { prefix: /^\/api\/progress/,          methods: ['POST'],                     permission: 'progress:write'},
  { prefix: /^\/api\/alerts/,            methods: ['GET'],                      permission: 'alerts:read'   },
  { prefix: /^\/api\/alerts/,            methods: ['PUT', 'POST'],              permission: 'alerts:write'  },
  { prefix: /^\/api\/(teams|members)/,   methods: ['GET'],                      permission: 'teams:read'    },
  { prefix: /^\/api\/(teams|members)/,   methods: ['POST', 'PUT', 'DELETE'],    permission: 'teams:write'   },
  { prefix: /^\/api\/import/,            methods: ['POST'],                     permission: 'tasks:write'   },
];

function requiredPermission(method: string, path: string): string | null {
  for (const rule of PERMISSION_MAP) {
    if (rule.prefix.test(path) && rule.methods.includes(method)) return rule.permission;
  }
  return null; // no restriction (e.g. /api/api-keys managed via JWT only)
}

function checkPermission(permissions: string[], method: string, path: string): boolean {
  const required = requiredPermission(method, path);
  if (!required) return true;
  return permissions.includes(required);
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    logger.warn('auth: missing token', { method: req.method, path: req.path });
    res.status(401).json({ success: false, error: { message: 'No token provided' } });
    return;
  }

  const token = header.slice(7);

  if (token.startsWith('ttk_')) {
    try {
      const r = await fetch(`${IDENTITY_URL}/internal/api-keys/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Service-Token': process.env.SERVICE_TOKEN!,
        },
        body: JSON.stringify({ key: token }),
      });

      if (!r.ok) {
        const body = await r.json().catch(() => ({})) as { error?: { message?: string } };
        logger.warn('auth: api key invalid', { method: req.method, path: req.path, status: r.status });
        res.status(401).json({ success: false, error: { message: body?.error?.message || 'Invalid API key' } });
        return;
      }

      const body = await r.json() as {
        success: boolean;
        data: { sub: string; email: string; role: string; teamId?: string; permissions: string[] };
      };
      const userInfo = body.data;

      // Enforce scoped permissions
      if (!checkPermission(userInfo.permissions, req.method, req.path)) {
        logger.warn('auth: api key permission denied', {
          method: req.method, path: req.path, permissions: userInfo.permissions,
          required: requiredPermission(req.method, req.path),
        });
        res.status(403).json({ success: false, error: { message: 'API key does not have permission for this action' } });
        return;
      }

      req.user = { sub: userInfo.sub, email: userInfo.email, role: userInfo.role, teamId: userInfo.teamId };
      (req as any).syntheticJwt = jwt.sign(
        { sub: userInfo.sub, email: userInfo.email, role: userInfo.role, teamId: userInfo.teamId },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );

      logger.debug('auth: api key accepted', {
        method: req.method, path: req.path, sub: userInfo.sub, permissions: userInfo.permissions,
      });
      next();
    } catch (err) {
      logger.error('auth: api key validation error', { method: req.method, path: req.path, error: (err as Error).message });
      res.status(502).json({ success: false, error: { message: 'Auth service unavailable' } });
    }
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
    logger.debug('auth: token verified', { method: req.method, path: req.path, sub: payload.sub, role: payload.role });
    req.user = payload;
    next();
  } catch (err) {
    logger.warn('auth: invalid token', { method: req.method, path: req.path, error: (err as Error).message });
    res.status(401).json({ success: false, error: { message: 'Invalid or expired token' } });
  }
};
