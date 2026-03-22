import { apiFetch } from './client';

export interface ChannelPreference {
  enabled: boolean;
  minSeverity: 'low' | 'medium' | 'high' | 'critical';
}

export interface QuietHours {
  enabled: boolean;
  timezone: string;
  startHour: number;
  endHour: number;
}

export interface NotificationPreferences {
  channels: {
    inApp: ChannelPreference;
    email: ChannelPreference;
    push: ChannelPreference;
    slack: ChannelPreference;
  };
  mutedTypes: string[];
  quietHours?: QuietHours;
}

export interface NotificationRule {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  priority: number;
  conditionGroup: {
    logic: 'AND' | 'OR';
    conditions: Array<{
      field: string;
      op: string;
      value: string | string[] | number;
    }>;
  };
  actions: Array<{ kind: string; severity?: string; channels?: string[]; tag?: string }>;
  matchCount: number;
}

export const getPreferences = (): Promise<{ success: boolean; data: NotificationPreferences }> =>
  apiFetch('/preferences');

export const updatePreferences = (data: Partial<NotificationPreferences>): Promise<{ success: boolean; data: NotificationPreferences }> =>
  apiFetch('/preferences', { method: 'PUT', body: JSON.stringify(data) });

export const getRules = (): Promise<{ success: boolean; data: NotificationRule[] }> =>
  apiFetch('/rules');

export const createRule = (data: Omit<NotificationRule, '_id' | 'matchCount'>): Promise<{ success: boolean; data: NotificationRule }> =>
  apiFetch('/rules', { method: 'POST', body: JSON.stringify(data) });

export const updateRule = (id: string, data: Partial<NotificationRule>): Promise<{ success: boolean; data: NotificationRule }> =>
  apiFetch(`/rules/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteRule = (id: string): Promise<{ success: boolean }> =>
  apiFetch(`/rules/${id}`, { method: 'DELETE' });
