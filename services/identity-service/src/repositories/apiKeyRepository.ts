import crypto from 'crypto';
import ApiKey from '../models/ApiKey';
import { logger } from '@task-tracker/utils';

export const hashKey = (rawKey: string): string =>
  crypto.createHash('sha256').update(rawKey).digest('hex');

export const create = async (data: {
  userId: string;
  name: string;
  rawKey: string;
  expiresAt: Date | null;
}) => {
  logger.debug('apiKeyRepository.create', { userId: data.userId, name: data.name });
  const keyHash = hashKey(data.rawKey);
  const prefix = data.rawKey.slice(0, 10);
  const doc = await ApiKey.create({
    userId: data.userId,
    name: data.name,
    keyHash,
    prefix,
    expiresAt: data.expiresAt,
  });
  logger.debug('apiKeyRepository.create result', { id: String(doc._id) });
  return doc;
};

export const findAllByUser = async (userId: string) => {
  logger.debug('apiKeyRepository.findAllByUser', { userId });
  const keys = await ApiKey.find({ userId })
    .select('-keyHash')
    .sort({ createdAt: -1 })
    .lean();
  logger.debug('apiKeyRepository.findAllByUser result', { count: keys.length });
  return keys;
};

export const findById = async (id: string) => {
  logger.debug('apiKeyRepository.findById', { id });
  return ApiKey.findById(id).lean();
};

export const findByRawKey = async (rawKey: string) => {
  logger.debug('apiKeyRepository.findByRawKey');
  const keyHash = hashKey(rawKey);
  return ApiKey.findOne({ keyHash }).lean();
};

export const deleteById = async (id: string) => {
  logger.debug('apiKeyRepository.deleteById', { id });
  return ApiKey.findByIdAndDelete(id).lean();
};
