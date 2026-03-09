import { apiFetch } from './client';

export const logProgress     = (data: Record<string, unknown>): Promise<any> => apiFetch('/progress', { method: 'POST', body: JSON.stringify(data) });
export const getHistory      = (taskId: string | undefined): Promise<any>     => apiFetch(`/progress/task/${taskId}`);
export const getLatest       = (taskId: string): Promise<any>                  => apiFetch(`/progress/latest/${taskId}`);
export const getTeamProgress = (teamId: string): Promise<any>                  => apiFetch(`/progress/team/${teamId}`);
