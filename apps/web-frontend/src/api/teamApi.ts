import { apiFetch } from './client';

export const listTeams = (): Promise<any>          => apiFetch('/teams');
export const getTeam   = (id: string): Promise<any> => apiFetch(`/teams/${id}`);
