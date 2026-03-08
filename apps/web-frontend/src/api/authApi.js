import { apiFetch } from './client';

export const login          = (email, password) => apiFetch('/auth/login',     { method: 'POST', body: JSON.stringify({ email, password }) });
export const register       = (data)            => apiFetch('/auth/register',   { method: 'POST', body: JSON.stringify(data) });
export const microsoftLogin = (idToken)         => apiFetch('/auth/microsoft',  { method: 'POST', body: JSON.stringify({ idToken }) });
