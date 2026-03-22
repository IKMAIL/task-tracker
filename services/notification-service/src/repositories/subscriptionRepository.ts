import Subscription, { ISubscription, WatchLevel } from '../models/Subscription';
import { logger } from '@task-tracker/utils';

export const findByUser = async (userId: string): Promise<ISubscription[]> => {
  logger.debug('subscriptionRepository.findByUser', { userId });
  return Subscription.find({ userId }).lean() as unknown as ISubscription[];
};

export const findByTask = async (taskId: string): Promise<ISubscription[]> => {
  logger.debug('subscriptionRepository.findByTask', { taskId });
  return Subscription.find({ taskId }).lean() as unknown as ISubscription[];
};

export const countByUser = async (userId: string): Promise<number> => {
  return Subscription.countDocuments({ userId });
};

export const create = async (data: { userId: string; taskId: string; watchLevel?: WatchLevel; autoUnsubscribeOnComplete?: boolean }): Promise<ISubscription> => {
  logger.debug('subscriptionRepository.create', data);
  const doc = await Subscription.create(data);
  return doc;
};

export const remove = async (userId: string, taskId: string): Promise<boolean> => {
  logger.debug('subscriptionRepository.remove', { userId, taskId });
  const result = await Subscription.deleteOne({ userId, taskId });
  return result.deletedCount > 0;
};
