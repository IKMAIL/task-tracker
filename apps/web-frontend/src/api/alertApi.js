import { apiFetch } from './client';

export const listAlerts     = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/alerts${qs ? `?${qs}` : ''}`);
};
export const getTeamAlerts  = (teamId)      => apiFetch(`/alerts/team/${teamId}`);
export const resolveAlert   = (id)          => apiFetch(`/alerts/${id}/resolve`, { method: 'PUT' });
export const runDetection   = ()            => apiFetch('/alerts/run-detection',  { method: 'POST' });
