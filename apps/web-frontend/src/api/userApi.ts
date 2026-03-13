import { apiFetch } from './client';

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  isActive: boolean;
  authProvider: 'local' | 'microsoft';
  createdAt: string;
}

export const listUsers = (): Promise<any> =>
  apiFetch('/users');

export const updateUser = (
  id: string,
  data: Partial<Pick<AdminUser, 'role' | 'isActive'>>,
): Promise<any> =>
  apiFetch(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
