import { apiFetch } from './client';

export interface ApiKeyInfo {
  id: string;
  name: string;
  prefix: string;
  expiresAt: string | null;
  createdAt: string;
}

export interface CreateApiKeyResponse extends ApiKeyInfo {
  key: string;
}

export const listApiKeys = (): Promise<{ success: boolean; data: ApiKeyInfo[] }> =>
  apiFetch('/api-keys');

export const createApiKey = (body: { name: string; expiresAt?: string | null }): Promise<{ success: boolean; data: CreateApiKeyResponse }> =>
  apiFetch('/api-keys', { method: 'POST', body: JSON.stringify(body) });

export const revokeApiKey = (id: string): Promise<{ success: boolean; data: { message: string } }> =>
  apiFetch(`/api-keys/${id}`, { method: 'DELETE' });
