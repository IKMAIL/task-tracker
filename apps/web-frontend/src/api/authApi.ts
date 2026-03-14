import { apiFetch } from './client';

export const microsoftLogin = (idToken: string): Promise<any> => apiFetch('/auth/microsoft', { method: 'POST', body: JSON.stringify({ idToken }) });
