import { Request, Response, NextFunction } from 'express';
import * as repo from '../repositories/ruleRepository';

const uid = (req: Request): string => req.user!.sub as string;

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rules = await repo.findByUser(uid(req));
    res.json({ success: true, data: rules });
  } catch (err) { next(err); }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rule = await repo.create(uid(req), req.body);
    res.status(201).json({ success: true, data: rule });
  } catch (err) { next(err); }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rule = await repo.updateById(req.params.id, uid(req), req.body);
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
