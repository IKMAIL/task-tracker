import { apiFetch } from './client';

export const listTeams  = (): Promise<any>                                       => apiFetch('/teams');
export const getTeam    = (id: string): Promise<any>                             => apiFetch(`/teams/${id}`);
export const createTeam = (data: Record<string, unknown>): Promise<any>          => apiFetch('/teams', { method: 'POST', body: JSON.stringify(data) });
export const updateTeam = (id: string, data: Record<string, unknown>): Promise<any> => apiFetch(`/teams/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteTeam = (id: string): Promise<any>                             => apiFetch(`/teams/${id}`, { method: 'DELETE' });

// Member CRUD
export const listMembers  = (): Promise<any>                                      => apiFetch('/members');
export const getMember    = (id: string): Promise<any>                            => apiFetch(`/members/${id}`);
export const createMember = (data: Record<string, unknown>): Promise<any>         => apiFetch('/members', { method: 'POST', body: JSON.stringify(data) });
export const updateMember = (id: string, data: Record<string, unknown>): Promise<any> => apiFetch(`/members/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteMember = (id: string): Promise<any>                            => apiFetch(`/members/${id}`, { method: 'DELETE' });

// Team-member association
export const addMemberToTeam      = (teamId: string, memberId: string): Promise<any> => apiFetch(`/teams/${teamId}/members`, { method: 'POST', body: JSON.stringify({ memberId }) });
export const removeMemberFromTeam = (teamId: string, memberId: string): Promise<any> => apiFetch(`/teams/${teamId}/members/${memberId}`, { method: 'DELETE' });
