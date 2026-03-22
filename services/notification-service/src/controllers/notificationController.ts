import { Request, Response, NextFunction } from 'express';
import * as repo from '../repositories/notificationRepository';
import { logger } from '@task-tracker/utils';

const MAX_SNOOZE_DAYS = 30;

const uid = (req: Request): string => req.user!.sub as string;

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(Math.max(1, Number(req.query.limit) || 25), 100);
    const isRead = req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined;
    const archived = req.query.archived === 'true';

    const { notifications, total } = await repo.findByUser(uid(req), { isRead, archived, page, limit });
    res.json({ success: true, data: notifications, pagination: { page, limit, total } });
  } catch (err) { next(err); }
};

export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notification = await repo.findById(uid(req), req.params.id);
    if (!notification) {
      res.status(404).json({ success: false, error: { message: 'Notification not found' } });
      return;
    }
    res.json({ success: true, data: notification });
  } catch (err) { next(err); }
};

export const unreadCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const count = await repo.countUnread(uid(req));
    res.json({ success: true, data: { count } });
  } catch (err) { next(err); }
};

export const markRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ids: string[] = Array.isArray(req.body.ids) ? req.body.ids : [];
    await repo.markRead(uid(req), ids);
    const unreadCount = await repo.countUnread(uid(req));
    logger.debug('notificationController.markRead', { userId: uid(req), ids, unreadCount });
    res.json({ success: true, data: { unreadCount } });
  } catch (err) { next(err); }
};

export const snooze = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const until = new Date(req.body.until);

    if (isNaN(until.getTime())) {
      res.status(400).json({ success: false, error: { message: 'Invalid date for snoozeUntil' } });
      return;
    }

    if (until <= new Date()) {
      res.status(400).json({ success: false, error: { message: 'Snooze date must be in the future' } });
      return;
    }

    const maxDate = new Date(Date.now() + MAX_SNOOZE_DAYS * 24 * 60 * 60 * 1000);
    if (until > maxDate) {
      res.status(400).json({ success: false, error: { message: `Maximum snooze is ${MAX_SNOOZE_DAYS} days` } });
      return;
    }

    const notification = await repo.snooze(uid(req), id, until);
    if (!notification) {
      res.status(404).json({ success: false, error: { message: 'Notification not found' } });
      return;
    }
    res.json({ success: true, data: notification });
  } catch (err) { next(err); }
};

export const dismiss = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ok = await repo.archive(uid(req), req.params.id);
    if (!ok) {
      res.status(404).json({ success: false, error: { message: 'Notification not found' } });
      return;
    }
    res.status(204).send();
  } catch (err) { next(err); }
};
