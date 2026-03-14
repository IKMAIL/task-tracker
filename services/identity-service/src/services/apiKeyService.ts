import crypto from 'crypto';
import * as apiKeyRepository from '../repositories/apiKeyRepository';
import * as userRepository from '../repositories/userRepository';
import { logger } from '@task-tracker/utils';

const generateRawKey = (): string =>
  'ttk_' + crypto.randomBytes(32).toString('hex');

const makeError = (message: string, status: number): Error & { status: number } =>
  Object.assign(new Error(message), { status });

export async function createKey(data: { userId: string; name: string; expiresAt?: string | null }) {
  const rawKey = generateRawKey();
  const expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
  const doc = await apiKeyRepository.create({ userId: data.userId, name: data.name, rawKey, expiresAt });
  logger.info('api-key created', { userId: data.userId, keyId: String(doc._id), name: data.name });
  return {
    id: String(doc._id),
    name: doc.name,
    prefix: doc.prefix,
    expiresAt: doc.expiresAt,
    createdAt: doc.createdAt,
    key: rawKey,
  };
}

export async function listKeys(userId: string) {
  const keys = await apiKeyRepository.findAllByUser(userId);
  return keys.map((k) => ({
    id: String(k._id),
    name: k.name,
    prefix: k.prefix,
    expiresAt: k.expiresAt,
    createdAt: k.createdAt,
  }));
}

export async function revokeKey(keyId: string, requestingUserId: string) {
  const key = await apiKeyRepository.findById(keyId);
  if (!key) throw makeError('API key not found', 404);
  if (String(key.userId) !== requestingUserId) throw makeError('Forbidden', 403);
  await apiKeyRepository.deleteById(keyId);
  logger.info('api-key revoked', { keyId, requestingUserId });
}

export async function validateKey(rawKey: string) {
  const keyDoc = await apiKeyRepository.findByRawKey(rawKey);
  if (!keyDoc) throw makeError('Invalid API key', 401);
  if (keyDoc.expiresAt && keyDoc.expiresAt < new Date()) throw makeError('API key expired', 401);
  const user = await userRepository.findById(String(keyDoc.userId));
  if (!user) throw makeError('Invalid API key', 401);
  logger.debug('apiKeyService.validateKey: valid', { keyId: String(keyDoc._id), userId: String(user._id) });
  return {
    sub: String(user._id),
    email: user.email,
    role: user.role,
    teamId: user.teamId ? String(user.teamId) : undefined,
  };
}
