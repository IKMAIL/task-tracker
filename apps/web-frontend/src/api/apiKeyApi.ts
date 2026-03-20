import { apiFetch, ApiResponse } from './client';

export const ALL_PERMISSIONS = [
  'tasks:read',
  'tasks:write',
  'progress:read',
  'progress:write',
  'alerts:read',
  'alerts:write',
  'teams:read',
  'teams:write',
] as const;

export type ApiKeyPermission = typeof ALL_PERMISSIONS[number];

export interface ApiKeyInfo {
  id: string;
  name: string;
  prefix: string;
  permissions: ApiKeyPermission[];
  isActive: boolean;
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface CreateApiKeyResponse extends ApiKeyInfo {
  key: string;
}

export const listApiKeys = (): Promise<ApiResponse<ApiKeyInfo[]>> =>
  apiFetch('/api-keys');

export const createApiKey = (body: {
  name: string;
  permissions: ApiKeyPermission[];
  expiresAt?: string | null;
}): Promise<ApiResponse<CreateApiKeyResponse>> =>
  apiFetch('/api-keys', { method: 'POST', body: JSON.stringify(body) });

export const revokeApiKey = (id: string): Promise<ApiResponse<{ message: string }>> =>
  apiFetch(`/api-keys/${id}`, { method: 'DELETE' });
