import { Request, Response, NextFunction } from 'express';
import * as repo from '../repositories/preferenceRepository';

const uid = (req: Request): string => req.user!.sub as string;

const ALLOWED_PREF_KEYS = ['channels', 'mutedTypes', 'quietHours'] as const;

export const get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pref = await repo.findByUser(uid(req));
    res.json({ success: true, data: pref });
  } catch (err) { next(err); }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Whitelist fields to prevent userId or other internal fields from being overwritten
    const body = req.body as Record<string, unknown>;
    const sanitized: Record<string, unknown> = {};
    for (const key of ALLOWED_PREF_KEYS) {
      if (key in body) sanitized[key] = body[key];
    }
    const pref = await repo.upsert(uid(req), sanitized);
    res.json({ success: true, data: pref });
  } catch (err) { next(err); }
};
