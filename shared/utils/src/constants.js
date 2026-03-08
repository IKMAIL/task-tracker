const TASK_STATUSES = ['not_started', 'in_progress', 'blocked', 'completed', 'cancelled'];

const TASK_CATEGORIES = [
  'Automation Testing Coverage',
  'DR Dry Run',
  'Active-Active Setup',
  'LEAP Framework Adherence',
  'Claude Code Adoption %',
  'Open Operational Items',
  'Security Risk Items',
];

const ALERT_TYPES = ['past_due', 'update_overdue', 'behind_schedule', 'stalled'];

const ALERT_SEVERITIES = ['low', 'medium', 'high'];

const USER_ROLES = ['admin', 'member'];

// Default team names — can be overridden via seed script
const DEFAULT_TEAMS = [
  'Team Alpha',
  'Team Beta',
  'Team Gamma',
  'Team Delta',
  'Team Epsilon',
  'Team Zeta',
  'Team Eta',
];

module.exports = {
  TASK_STATUSES,
  TASK_CATEGORIES,
  ALERT_TYPES,
  ALERT_SEVERITIES,
  USER_ROLES,
  DEFAULT_TEAMS,
};
