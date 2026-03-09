export const TASK_STATUSES = ['not_started', 'in_progress', 'blocked', 'completed', 'cancelled'] as const;

export const TASK_CATEGORIES = [
  'Automation Testing Coverage',
  'DR Dry Run',
  'Active-Active Setup',
  'LEAP Framework Adherence',
  'Claude Code Adoption %',
  'Open Operational Items',
  'Security Risk Items',
] as const;

export const ALERT_TYPES = ['past_due', 'update_overdue', 'behind_schedule', 'stalled'] as const;

export const ALERT_SEVERITIES = ['low', 'medium', 'high'] as const;

export const USER_ROLES = ['admin', 'member'] as const;

export const DEFAULT_TEAMS = [
  'Team Alpha',
  'Team Beta',
  'Team Gamma',
  'Team Delta',
  'Team Epsilon',
  'Team Zeta',
  'Team Eta',
] as const;

export type TaskStatus = typeof TASK_STATUSES[number];
export type TaskCategory = typeof TASK_CATEGORIES[number];
export type AlertType = typeof ALERT_TYPES[number];
export type AlertSeverity = typeof ALERT_SEVERITIES[number];
export type UserRole = typeof USER_ROLES[number];
