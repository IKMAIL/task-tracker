import { apiFetch } from './client';

export interface Notification {
  _id: string;
  userId: string;
  sourceType: string;
  type: string;
  title: string;
  body: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  readAt?: string;
  snoozeUntil?: string;
  createdAt: string;
}

export const listNotifications = (params: { page?: number; limit?: number; isRead?: boolean } = {}) => {
  const qs = new URLSearchParams();
  if (params.page !== undefined) qs.set('page', String(params.page));
  if (params.limit !== undefined) qs.set('limit', String(params.limit));
  if (params.isRead !== undefined) qs.set('isRead', String(params.isRead));
  return apiFetch(`/notifications?${qs}`);
};

export const getUnreadCount = () => apiFetch('/notifications/unread-count');

export const markRead = (ids: string[]) =>
  apiFetch('/notifications/mark-read', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });

export const snoozeNotification = (id: string, until: Date) =>
  apiFetch(`/notifications/${id}/snooze`, {
    method: 'PUT',
    body: JSON.stringify({ until: until.toISOString() }),
  });

export const dismissNotification = (id: string) =>
  apiFetch(`/notifications/${id}`, { method: 'DELETE' });
