import { Worker, Job } from 'bullmq';
import { logger } from '@task-tracker/utils';
import { digestQueue, emailQueue, makeConnection } from '../utils/queues';
import Notification from '../models/Notification';
import NotificationPreference from '../models/NotificationPreference';
import { NotificationSeverity, NotificationType } from '../models/Notification';

export interface DigestJob {
  userId: string;
  timezone: string;
}

const MAX_DIGEST_ITEMS = 50;
const DIGEST_LOOKBACK_HOURS = 24;

interface DigestGroup {
  type: NotificationType;
  severity: NotificationSeverity;
  titles: string[];
  count: number;
}

function buildDigestHtml(groups: DigestGroup[], userId: string): string {
  const rows = groups
    .map(
      (g) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;">${g.type.replace(/_/g, ' ')}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;">${g.severity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;">${g.count}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;">${g.titles.slice(0, 2).join(', ')}${g.titles.length > 2 ? ' …' : ''}</td>
    </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;color:#333;max-width:600px;margin:0 auto;padding:24px">
  <h2 style="border-bottom:2px solid #4f46e5;padding-bottom:8px">Your Daily Notification Digest</h2>
  <p>Here's a summary of your notifications from the last ${DIGEST_LOOKBACK_HOURS} hours:</p>
  <table style="width:100%;border-collapse:collapse">
    <thead>
      <tr style="background:#f5f5f5">
        <th style="padding:8px 12px;text-align:left">Type</th>
        <th style="padding:8px 12px;text-align:left">Severity</th>
        <th style="padding:8px 12px;text-align:left">Count</th>
        <th style="padding:8px 12px;text-align:left">Items</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <p style="margin-top:24px;font-size:12px;color:#999">
    You have ${groups.reduce((s, g) => s + g.count, 0)} total notifications.
    <a href="${process.env.APP_URL || 'http://localhost:3005'}/preferences">Manage preferences</a>
  </p>
</body>
</html>`;
}

function buildDigestText(groups: DigestGroup[]): string {
  const lines = groups.map(
    (g) => `- ${g.type.replace(/_/g, ' ')} (${g.severity}): ${g.count} notification(s)`
  );
  return `Your Daily Notification Digest\n\n${lines.join('\n')}\n\nTotal: ${groups.reduce((s, g) => s + g.count, 0)}`;
}

async function processDigestJob(job: Job<DigestJob>): Promise<void> {
  const { userId } = job.data;

  // Only send digest if email channel is enabled for this user
  const pref = await NotificationPreference.findOne({ userId }).lean();
  if (!pref?.channels?.email?.enabled) {
    logger.debug('digestWorker: email disabled for user, skipping', { userId });
    return;
  }

  const since = new Date(Date.now() - DIGEST_LOOKBACK_HOURS * 60 * 60 * 1000);

  const notifications = await Notification.find({
    userId,
    isRead: false,
    archivedAt: null,
    createdAt: { $gte: since },
  })
    .sort({ severity: -1, createdAt: -1 })
    .limit(MAX_DIGEST_ITEMS)
    .lean();

  if (notifications.length === 0) {
    logger.debug('digestWorker: no unread notifications, skipping digest', { userId });
    return;
  }

  // Group by type + severity
  const groupMap = new Map<string, DigestGroup>();
  for (const n of notifications) {
    const key = `${n.type}:${n.severity}`;
    const existing = groupMap.get(key);
    if (existing) {
      existing.count++;
      if (existing.titles.length < 3) existing.titles.push(n.title);
    } else {
      groupMap.set(key, {
        type: n.type,
        severity: n.severity,
        titles: [n.title],
        count: 1,
      });
    }
  }

  const groups = Array.from(groupMap.values()).sort((a, b) => {
    const sev = { critical: 3, high: 2, medium: 1, low: 0 };
    return (sev[b.severity] ?? 0) - (sev[a.severity] ?? 0);
  });

  const total = groups.reduce((s, g) => s + g.count, 0);
  const subject = `Task Tracker: ${total} notification${total !== 1 ? 's' : ''} in the last ${DIGEST_LOOKBACK_HOURS}h`;

  await emailQueue.add('digest-email', {
    notificationId: `digest:${userId}:${Date.now()}`,
    userId,
    to: pref.channels.email ? userId : '', // In real impl, look up user email from identity-service
    subject,
    html: buildDigestHtml(groups, userId),
    plainText: buildDigestText(groups),
  });

  logger.info('digestWorker: digest queued', { userId, total, groups: groups.length });
}

export function startDigestWorker(): void {
  if (process.env.ENABLE_EMAIL_CHANNEL !== 'true') {
    logger.info('digestWorker: email channel disabled, skipping');
    return;
  }

  const worker = new Worker<DigestJob>(
    'digest-delivery',
    processDigestJob,
    { connection: makeConnection(), concurrency: 5 }
  );

  worker.on('failed', (job, err) => {
    if (job) logger.warn('digestWorker: job failed', { jobId: job.id, error: err.message });
  });

  worker.on('completed', (job) => {
    logger.debug('digestWorker: job completed', { jobId: job.id });
  });

  logger.info('digestWorker: started');
}

/**
 * Enqueue digest jobs for all users who have email digests enabled.
 * Called by a cron schedule — e.g., daily at 08:00 per user's timezone.
 */
export async function enqueueDigestsForAllUsers(): Promise<void> {
  const PAGE_SIZE = 500;
  const today = new Date().toISOString().slice(0, 10);
  let skip = 0;
  let total = 0;

  while (true) {
    const prefs = await NotificationPreference.find({ 'channels.email.enabled': true })
      .select('userId quietHours')
      .skip(skip)
      .limit(PAGE_SIZE)
      .lean();

    if (prefs.length === 0) break;

    for (const pref of prefs) {
      await digestQueue.add(
        'daily-digest',
        { userId: pref.userId, timezone: pref.quietHours?.timezone || 'UTC' },
        { jobId: `digest:${pref.userId}:${today}` }
      );
    }

    total += prefs.length;
    skip += PAGE_SIZE;
    if (prefs.length < PAGE_SIZE) break;
  }

  logger.info('digestWorker: enqueued digests', { total });
}
