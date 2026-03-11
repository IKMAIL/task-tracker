import { apiFetch } from './client';

export const listTeams  = (): Promise<any>                                       => apiFetch('/teams');
export const getTeam    = (id: string): Promise<any>                             => apiFetch(`/teams/${id}`);
export const createTeam = (data: Record<string, unknown>): Promise<any>          => apiFetch('/teams', { method: 'POST', body: JSON.stringify(data) });
export const updateTeam = (id: string, data: Record<string, unknown>): Promise<any> => apiFetch(`/teams/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteTeam = (id: string): Promise<any>                             => apiFetch(`/teams/${id}`, { method: 'DELETE' });
