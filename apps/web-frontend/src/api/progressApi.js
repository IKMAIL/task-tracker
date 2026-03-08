import { apiFetch } from './client';

export const logProgress     = (data)   => apiFetch('/progress',                { method: 'POST', body: JSON.stringify(data) });
export const getHistory      = (taskId) => apiFetch(`/progress/task/${taskId}`);
export const getLatest       = (taskId) => apiFetch(`/progress/latest/${taskId}`);
export const getTeamProgress = (teamId) => apiFetch(`/progress/team/${teamId}`);
