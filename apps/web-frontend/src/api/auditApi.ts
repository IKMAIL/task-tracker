import { apiFetch } from './client';

export interface AuditLog {
  _id: string;
  resourceType: string;
  resourceId: string;
  action: 'create' | 'update' | 'delete';
  userId: string | null;
  userEmail: string | null;
  changes: {
    before: Record<string, unknown> | null;
    after: Record<string, unknown> | null;
  };
  timestamp: string;
}

export interface AuditMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AuditResponse {
  success: boolean;
  data: AuditLog[];
  meta: AuditMeta;
}

export const getAuditLogs = (
  resourceType: string,
  resourceId: string,
  page = 1,
  limit = 50,
): Promise<AuditResponse> =>
  apiFetch(
    `/audit?resourceType=${encodeURIComponent(resourceType)}&resourceId=${encodeURIComponent(resourceId)}&page=${page}&limit=${limit}`,
  );

const ACTOR_AUDIT_ENDPOINTS = [
  '/audit',
  '/audit/progress',
  '/audit/teams',
  '/audit/alerts',
  '/audit/users',
];

export const getAuditLogsByActor = async (
  actorId: string,
  since?: string,
  page = 1,
  limit = 50,
): Promise<AuditResponse> => {
  const params = new URLSearchParams({ actorId, limit: '200' });
  if (since) params.set('since', since);

  const results = await Promise.allSettled(
    ACTOR_AUDIT_ENDPOINTS.map(endpoint =>
      apiFetch<AuditResponse>(`${endpoint}?${params.toString()}`),
    ),
  );

  const allLogs: AuditLog[] = results
    .filter((r): r is PromiseFulfilledResult<AuditResponse> => r.status === 'fulfilled')
    .flatMap(r => r.value.data)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const total = allLogs.length;
  const start = (page - 1) * limit;
  return {
    success: true,
    data: allLogs.slice(start, start + limit),
    meta: { total, page, limit, pages: Math.ceil(total / limit) || 1 },
  };
};
