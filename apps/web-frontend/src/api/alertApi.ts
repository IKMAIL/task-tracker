import { apiFetch } from './client';

export const listAlerts    = (params: Record<string, string> = {}): Promise<any> => {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/alerts${qs ? `?${qs}` : ''}`);
};
export const getTeamAlerts = (teamId: string): Promise<any> => apiFetch(`/alerts/team/${teamId}`);
export const resolveAlert  = (id: string): Promise<any>     => apiFetch(`/alerts/${id}/resolve`, { method: 'PUT' });
export const runDetection  = (): Promise<any>               => apiFetch('/alerts/run-detection', { method: 'POST' });
