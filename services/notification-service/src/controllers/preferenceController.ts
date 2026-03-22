import { Request, Response } from 'express';
import * as repo from '../repositories/preferenceRepository';

const uid = (req: Request): string => req.user!.sub as string;

export const get = async (req: Request, res: Response): Promise<void> => {
  const pref = await repo.findByUser(uid(req));
  res.json({ success: true, data: pref });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const pref = await repo.upsert(uid(req), req.body);
  res.json({ success: true, data: pref });
};
