import NotificationPreference, { INotificationPreference } from '../models/NotificationPreference';
import { logger } from '@task-tracker/utils';

export const findByUser = async (userId: string): Promise<INotificationPreference | null> => {
  logger.debug('preferenceRepository.findByUser', { userId });
  return NotificationPreference.findOne({ userId }).lean() as unknown as INotificationPreference | null;
};

export const upsert = async (userId: string, data: Partial<INotificationPreference>): Promise<INotificationPreference> => {
  logger.debug('preferenceRepository.upsert', { userId });
  const doc = await NotificationPreference.findOneAndUpdate(
    { userId },
    { $set: data },
    { new: true, upsert: true, runValidators: true }
  ).lean();
  return doc as unknown as INotificationPreference;
};
