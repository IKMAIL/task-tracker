import { apiFetch } from './client';

export const login          = (email: string, password: string): Promise<any> => apiFetch('/auth/login',     { method: 'POST', body: JSON.stringify({ email, password }) });
export const register       = (data: Record<string, unknown>): Promise<any>   => apiFetch('/auth/register',   { method: 'POST', body: JSON.stringify(data) });
export const microsoftLogin = (idToken: string): Promise<any>                  => apiFetch('/auth/microsoft',       { method: 'POST', body: JSON.stringify({ idToken }) });
export const microsoftMerge = (idToken: string, password: string): Promise<any> => apiFetch('/auth/microsoft/merge', { method: 'POST', body: JSON.stringify({ idToken, password }) });
