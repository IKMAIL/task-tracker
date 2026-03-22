import { Request, Response } from 'express';
import * as repo from '../repositories/subscriptionRepository';
import { WatchLevel } from '../models/Subscription';

const uid = (req: Request): string => req.user!.sub as string;

const MAX_SUBSCRIPTIONS = 100;

export const list = async (req: Request, res: Response): Promise<void> => {
  const subs = await repo.findByUser(uid(req));
  res.json({ success: true, data: subs });
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const userId = uid(req);
  const { taskId, watchLevel, autoUnsubscribeOnComplete } = req.body as {
    taskId?: string;
    watchLevel?: WatchLevel;
    autoUnsubscribeOnComplete?: boolean;
  };

  if (!taskId) {
    res.status(400).json({ success: false, error: { message: 'taskId is required' } });
    return;
  }

  const count = await repo.countByUser(userId);
  if (count >= MAX_SUBSCRIPTIONS) {
    res.status(400).json({ success: false, error: { message: `Maximum ${MAX_SUBSCRIPTIONS} subscriptions per user` } });
    return;
  }

  try {
    const sub = await repo.create({ userId, taskId, watchLevel, autoUnsubscribeOnComplete });
    res.status(201).json({ success: true, data: sub });
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) {
      res.status(409).json({ success: false, error: { message: 'Already subscribed to this task' } });
      return;
    }
    throw err;
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const ok = await repo.remove(uid(req), req.params.taskId);
  if (!ok) {
    res.status(404).json({ success: false, error: { message: 'Subscription not found' } });
    return;
  }
  res.status(204).send();
};
