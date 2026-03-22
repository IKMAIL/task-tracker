import NotificationRule, { INotificationRule } from '../models/NotificationRule';
import { logger } from '@task-tracker/utils';

const MAX_RULES_PER_USER = 50;

export const findByUser = async (userId: string): Promise<INotificationRule[]> => {
  return NotificationRule.find({ userId }).sort({ priority: -1, createdAt: -1 }).lean() as unknown as INotificationRule[];
};

export const findActiveByUser = async (userId: string): Promise<INotificationRule[]> => {
  return NotificationRule.find({ userId, isActive: true }).sort({ priority: -1 }).lean() as unknown as INotificationRule[];
};

export const countByUser = async (userId: string): Promise<number> => {
  return NotificationRule.countDocuments({ userId });
};

export const create = async (userId: string, data: Partial<INotificationRule>): Promise<INotificationRule> => {
  const count = await countByUser(userId);
  if (count >= MAX_RULES_PER_USER) {
    throw Object.assign(new Error(`Max ${MAX_RULES_PER_USER} rules per user`), { status: 422 });
  }
  logger.debug('ruleRepository.create', { userId });
  const doc = await NotificationRule.create({ ...data, userId });
  return doc as unknown as INotificationRule;
};

export const updateById = async (
  id: string,
  userId: string,
  data: Partial<INotificationRule>
): Promise<INotificationRule | null> => {
  const doc = await NotificationRule.findOneAndUpdate(
    { _id: id, userId },
    { $set: data },
    { new: true, runValidators: true }
  ).lean();
  return doc as unknown as INotificationRule | null;
};

export const deleteById = async (id: string, userId: string): Promise<boolean> => {
  const result = await NotificationRule.deleteOne({ _id: id, userId });
  return result.deletedCount > 0;
};

export const incrementMatchCount = async (id: string): Promise<void> => {
  await NotificationRule.updateOne({ _id: id }, { $inc: { matchCount: 1 }, $set: { lastMatchedAt: new Date() } });
};
