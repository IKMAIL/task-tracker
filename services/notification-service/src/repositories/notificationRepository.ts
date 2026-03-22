import mongoose from 'mongoose';
import Notification, { INotification, NotificationType, NotificationSeverity, NotificationSourceType } from '../models/Notification';
import { logger } from '@task-tracker/utils';
import { emitToUser } from '../utils/socketServer';

export interface NotificationQuery {
  userId: string;
  isRead?: boolean;
  archivedAt?: null | { $ne: null };
  severity?: NotificationSeverity;
  type?: NotificationType;
}

export const create = async (data: Partial<INotification>): Promise<INotification | null> => {
  logger.debug('notificationRepository.create', { userId: data.userId, type: data.type });
  try {
    const doc = await Notification.create(data);
    // Emit real-time event to connected client
    emitToUser(doc.userId, 'notification:new', doc);
    return doc;
  } catch (err: unknown) {
    // Duplicate idempotency key — silently skip
    if ((err as { code?: number }).code === 11000) {
      logger.debug('notificationRepository.create: duplicate idempotencyKey, skipping', { key: data.idempotencyKey });
      return null;
    }
    throw err;
  }
};

export const findByUser = async (
  userId: string,
  { isRead, archived = false, page = 1, limit = 25 }: { isRead?: boolean; archived?: boolean; page?: number; limit?: number } = {}
): Promise<{ notifications: INotification[]; total: number }> => {
  const query: Record<string, unknown> = { userId };
  if (typeof isRead === 'boolean') query.isRead = isRead;
  query.archivedAt = archived ? { $ne: null } : null;

  const skip = (page - 1) * limit;
  const [notifications, total] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments(query),
  ]);
  return { notifications: notifications as unknown as INotification[], total };
};

export const countUnread = async (userId: string): Promise<number> => {
  return Notification.countDocuments({ userId, isRead: false, archivedAt: null });
};

export const markRead = async (userId: string, ids: string[]): Promise<number> => {
  const filter = ids.length > 0 ? { userId, _id: { $in: ids } } : { userId, isRead: false };
  const result = await Notification.updateMany(filter, { $set: { isRead: true, readAt: new Date() } });
  return result.modifiedCount;
};

export const snooze = async (userId: string, id: string, until: Date): Promise<INotification | null> => {
  const doc = await Notification.findOneAndUpdate(
    { _id: id, userId },
    { $set: { snoozeUntil: until } },
    { new: true }
  ).lean();
  return doc as unknown as INotification | null;
};

export const archive = async (userId: string, id: string): Promise<boolean> => {
  const result = await Notification.updateOne({ _id: id, userId }, { $set: { archivedAt: new Date() } });
  return result.modifiedCount > 0;
};

export const clearSnooze = async (id: string, userId: string): Promise<INotification | null> => {
  if (!mongoose.isValidObjectId(id)) {
    logger.warn('notificationRepository.clearSnooze: invalid ObjectId', { id });
    return null;
  }
  const doc = await Notification.findOneAndUpdate(
    { _id: id, userId },
    { $unset: { snoozeUntil: '' } },
    { new: true }
  ).lean();
  return doc as unknown as INotification | null;
};

export const findByIdempotencyKey = async (key: string): Promise<INotification | null> => {
  return Notification.findOne({ idempotencyKey: key }).lean() as unknown as INotification | null;
};

export const buildIdempotencyKey = (
  sourceType: NotificationSourceType,
  sourceId: string,
  type: NotificationType,
  userId: string
): string => `${sourceType}:${sourceId}:${type}:${userId}`;
