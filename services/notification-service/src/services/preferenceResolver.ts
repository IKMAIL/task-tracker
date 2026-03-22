import { INotification, NotificationSeverity } from '../models/Notification';
import { INotificationPreference } from '../models/NotificationPreference';
import { RuleResult } from './ruleEngine';
import { logger } from '@task-tracker/utils';

export type ChannelName = 'inApp' | 'email' | 'push' | 'slack';

export interface ResolverResult {
  shouldSuppress: boolean;
  channels: ChannelName[];
  effectiveSeverity: NotificationSeverity;
}

const SEVERITY_ORDER: Record<NotificationSeverity, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

function severityMeets(actual: NotificationSeverity, min: NotificationSeverity): boolean {
  return SEVERITY_ORDER[actual] >= SEVERITY_ORDER[min];
}

/**
 * Returns the current hour (0–23) in the given IANA timezone.
 * Falls back to UTC if the timezone is invalid.
 */
function currentHourInTz(timezone: string): number {
  try {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: timezone,
    }).formatToParts(now);
    const hourPart = parts.find((p) => p.type === 'hour');
    const h = parseInt(hourPart?.value ?? '0', 10);
    return isNaN(h) ? new Date().getUTCHours() : h % 24;
  } catch {
    return new Date().getUTCHours();
  }
}

function isQuietHours(pref: INotificationPreference): boolean {
  const qh = pref.quietHours;
  if (!qh || !qh.enabled) return false;

  const hour = currentHourInTz(qh.timezone || 'UTC');
  const { startHour, endHour } = qh;

  if (startHour <= endHour) {
    // e.g. 22:00–08:00 wraps midnight
    return hour >= startHour || hour < endHour;
  }
  // e.g. 09:00–17:00 same day
  return hour >= startHour && hour < endHour;
}

export function resolveChannels(
  notification: INotification,
  pref: INotificationPreference | null,
  ruleResult: RuleResult
): ResolverResult {
  const effectiveSeverity: NotificationSeverity =
    ruleResult.overrideSeverity ?? notification.severity;

  // Rule says suppress — skip everything
  if (ruleResult.suppress) {
    logger.debug('preferenceResolver: suppressed by rule', { userId: notification.userId });
    return { shouldSuppress: true, channels: [], effectiveSeverity };
  }

  // Default prefs when none exist: inApp only, all others off
  const channels = pref?.channels ?? {
    inApp: { enabled: true,  minSeverity: 'low' as NotificationSeverity },
    email: { enabled: false, minSeverity: 'low' as NotificationSeverity },
    push:  { enabled: false, minSeverity: 'medium' as NotificationSeverity },
    slack: { enabled: false, minSeverity: 'high' as NotificationSeverity },
  };

  const mutedTypes: string[] = pref?.mutedTypes ?? [];

  // Muted type check
  if (mutedTypes.includes(notification.type)) {
    logger.debug('preferenceResolver: type muted', { userId: notification.userId, type: notification.type });
    return { shouldSuppress: true, channels: [], effectiveSeverity };
  }

  const quietNow = pref ? isQuietHours(pref) : false;

  // If rule overrides channels, use those directly (bypass per-channel severity check but still obey quiet hours)
  if (ruleResult.overrideChannels && ruleResult.overrideChannels.length > 0) {
    const allowed = ruleResult.overrideChannels.filter((ch): ch is ChannelName =>
      ['inApp','email','push','slack'].includes(ch) && !(quietNow && ch !== 'inApp')
    );
    return { shouldSuppress: allowed.length === 0, channels: allowed, effectiveSeverity };
  }

  // Standard per-channel resolution
  const allChannels: ChannelName[] = ['inApp', 'email', 'push', 'slack'];
  const activeChannels: ChannelName[] = [];

  for (const ch of allChannels) {
    const cfg = channels[ch];
    if (!cfg.enabled) continue;
    if (!severityMeets(effectiveSeverity, cfg.minSeverity)) continue;
    // Quiet hours suppress everything except inApp
    if (quietNow && ch !== 'inApp') continue;
    activeChannels.push(ch);
  }

  return {
    shouldSuppress: activeChannels.length === 0,
    channels: activeChannels,
    effectiveSeverity,
  };
}
