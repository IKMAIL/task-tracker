import User from '../models/User';
import { logger } from '@task-tracker/utils';

export const findByEmail = async (email: string) => {
  logger.debug('userRepository.findByEmail', { email });
  const user = await User.findOne({ email }).lean();
  logger.debug('userRepository.findByEmail result', { email, found: !!user, user });
  return user;
};

export const findById = async (id: string) => {
  logger.debug('userRepository.findById', { id });
  const user = await User.findById(id).lean();
  logger.debug('userRepository.findById result', { id, found: !!user, user });
  return user;
};

export const findAll = async () => {
  logger.debug('userRepository.findAll');
  const users = await User.find().select('-passwordHash').lean();
  logger.debug('userRepository.findAll result', { count: users.length });
  return users;
};

export const create = async (data: Record<string, unknown>) => {
  logger.debug('userRepository.create', { data: { ...data, passwordHash: data.passwordHash ? '[REDACTED]' : undefined } });
  const user = await User.create(data);
  logger.debug('userRepository.create result', { userId: String(user._id) });
  return user;
};

export const findByMicrosoftId = async (microsoftId: string) => {
  logger.debug('userRepository.findByMicrosoftId', { microsoftId });
  const user = await User.findOne({ microsoftId }).lean();
  logger.debug('userRepository.findByMicrosoftId result', { microsoftId, found: !!user, user });
  return user;
};

export const updateById = async (id: string, data: Record<string, unknown>) => {
  logger.debug('userRepository.updateById', { id, data });
  const user = await User.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })
    .select('-passwordHash')
    .lean();
  logger.debug('userRepository.updateById result', { id, found: !!user, user });
  return user;
};
