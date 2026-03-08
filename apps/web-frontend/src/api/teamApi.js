import { apiFetch } from './client';

export const listTeams = ()    => apiFetch('/teams');
export const getTeam   = (id)  => apiFetch(`/teams/${id}`);
