import { apiFetch } from './client';

export const listTasks  = (params: Record<string, string> = {}): Promise<any> => {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/tasks${qs ? `?${qs}` : ''}`);
};
export const getTask    = (id: string | undefined): Promise<any> => apiFetch(`/tasks/${id}`);
export const createTask = (data: Record<string, unknown>): Promise<any>        => apiFetch('/tasks', { method: 'POST', body: JSON.stringify(data) });
export const updateTask = (id: string, data: Record<string, unknown>): Promise<any> => apiFetch(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const getByTeam  = (teamId: string): Promise<any>                       => apiFetch(`/tasks/team/${teamId}`);
export const getSummary = (): Promise<any>                                      => apiFetch('/tasks/summary');
export const searchTasks = (q: string, params: Record<string, string> = {}): Promise<any> => {
  const qs = new URLSearchParams({ q, ...params }).toString();
  return apiFetch(`/tasks/search?${qs}`);
};
export const getComments = (taskId: string): Promise<any> => apiFetch(`/tasks/${taskId}/comments`);
export const addComment  = (taskId: string, body: string): Promise<any> =>
  apiFetch(`/tasks/${taskId}/comments`, { method: 'POST', body: JSON.stringify({ body }) });
export const getDependencies = (taskId: string): Promise<any> => apiFetch(`/tasks/${taskId}/dependencies`);
