import crypto from 'crypto';
import * as apiKeyRepository from '../repositories/apiKeyRepository';
import * as userRepository from '../repositories/userRepository';
import { API_KEY_PERMISSIONS, ApiKeyPermission } from '../models/ApiKey';
import { logger } from '@task-tracker/utils';

const generateRawKey = (): string =>
  'ttk_' + crypto.randomBytes(32).toString('hex');

const makeError = (message: string, status: number): Error & { status: number } =>
  Object.assign(new Error(message), { status });

export async function createKey(data: {
  userId: string;
  name: string;
  permissions: ApiKeyPermission[];
  expiresAt?: string | null;
}) {
  if (data.permissions.length === 0) throw makeError('At least one permission is required', 400);
  const rawKey = generateRawKey();
  const expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
  const doc = await apiKeyRepository.create({
    userId: data.userId,
    name: data.name,
    rawKey,
    permissions: data.permissions,
    expiresAt,
  });
  logger.info('api-key created', { userId: data.userId, keyId: String(doc._id), name: data.name, permissions: data.permissions });
  return {
    id: String(doc._id),
    name: doc.name,
    prefix: doc.prefix,
    permissions: doc.permissions,
    isActive: doc.isActive,
    expiresAt: doc.expiresAt,
    lastUsedAt: doc.lastUsedAt,
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
    permissions: k.permissions,
    isActive: k.isActive,
    expiresAt: k.expiresAt,
    lastUsedAt: k.lastUsedAt,
    createdAt: k.createdAt,
  }));
}

export async function revokeKey(keyId: string, requestingUserId: string) {
  const key = await apiKeyRepository.findById(keyId);
  if (!key) throw makeError('API key not found', 404);
  if (String(key.userId) !== requestingUserId) throw makeError('Forbidden', 403);
  await apiKeyRepository.deactivateById(keyId);
  logger.info('api-key revoked (deactivated)', { keyId, requestingUserId });
}

export async function validateKey(rawKey: string) {
  const keyDoc = await apiKeyRepository.findByRawKey(rawKey);
  if (!keyDoc) throw makeError('Invalid API key', 401);
  if (keyDoc.expiresAt && keyDoc.expiresAt < new Date()) throw makeError('API key expired', 401);
  const user = await userRepository.findById(String(keyDoc.userId));
  if (!user) throw makeError('Invalid API key', 401);
  // Update lastUsedAt asynchronously — don't block the response
  apiKeyRepository.updateLastUsed(String(keyDoc._id)).catch((err) =>
    logger.warn('apiKeyService: failed to update lastUsedAt', { keyId: String(keyDoc._id), error: err.message })
  );
  logger.debug('apiKeyService.validateKey: valid', { keyId: String(keyDoc._id), userId: String(user._id) });
  return {
    sub: String(user._id),
    email: user.email,
    role: user.role,
    teamId: user.teamId ? String(user.teamId) : undefined,
    permissions: keyDoc.permissions,
  };
}

export { API_KEY_PERMISSIONS };
