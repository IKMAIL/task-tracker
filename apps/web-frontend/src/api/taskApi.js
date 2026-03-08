import { apiFetch } from './client';

export const listTasks   = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/tasks${qs ? `?${qs}` : ''}`);
};
export const getTask     = (id)          => apiFetch(`/tasks/${id}`);
export const createTask  = (data)        => apiFetch('/tasks',      { method: 'POST', body: JSON.stringify(data) });
export const updateTask  = (id, data)    => apiFetch(`/tasks/${id}`, { method: 'PUT',  body: JSON.stringify(data) });
export const getByTeam   = (teamId)      => apiFetch(`/tasks/team/${teamId}`);
export const getSummary  = ()            => apiFetch('/tasks/summary');
