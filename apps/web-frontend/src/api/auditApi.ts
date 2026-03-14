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

export const getAuditLogsByActor = (
  actorId: string,
  since?: string,
  page = 1,
  limit = 50,
): Promise<AuditResponse> => {
  const params = new URLSearchParams({ actorId, page: String(page), limit: String(limit) });
  if (since) params.set('since', since);
  return apiFetch(`/audit?${params.toString()}`);
};
