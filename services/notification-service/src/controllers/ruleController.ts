import { Request, Response, NextFunction } from 'express';
import * as repo from '../repositories/ruleRepository';

const uid = (req: Request): string => req.user!.sub as string;

const ALLOWED_RULE_KEYS = ['name', 'isActive', 'priority', 'conditionGroup', 'actions'] as const;

function sanitizeRuleBody(body: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const key of ALLOWED_RULE_KEYS) {
    if (key in body) sanitized[key] = body[key];
  }
  return sanitized;
}

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rules = await repo.findByUser(uid(req));
    res.json({ success: true, data: rules });
  } catch (err) { next(err); }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body = sanitizeRuleBody(req.body as Record<string, unknown>);
    if (!body.name || !body.conditionGroup) {
      res.status(400).json({ success: false, error: { message: 'name and conditionGroup are required' } });
      return;
    }
    const rule = await repo.create(uid(req), body);
    res.status(201).json({ success: true, data: rule });
  } catch (err) { next(err); }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body = sanitizeRuleBody(req.body as Record<string, unknown>);
    const rule = await repo.updateById(req.params.id, uid(req), body);
    if (!rule) { res.status(404).json({ success: false, message: 'Rule not found' }); return; }
    res.json({ success: true, data: rule });
  } catch (err) { next(err); }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await repo.deleteById(req.params.id, uid(req));
    if (!deleted) { res.status(404).json({ success: false, message: 'Rule not found' }); return; }
    res.json({ success: true });
  } catch (err) { next(err); }
};
