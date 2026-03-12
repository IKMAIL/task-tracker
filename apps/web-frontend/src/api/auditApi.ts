import { apiFetch } from './client';

export interface AuditLog {
  _id: string;
  resourceType: string;
  resourceId: string;
  action: 'create' | 'update' | 'delete';
  actorId: string;
  actorEmail: string | null;
  changes: {
    before: Record<string, unknown> | null;
    after: Record<string, unknown> | null;
  };
  metadata: Record<string, unknown>;
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
