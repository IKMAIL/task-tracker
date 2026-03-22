import { Redis } from 'ioredis';
import { logger } from '@task-tracker/utils';
import { getRedisClient } from './redisClient';
import * as notificationRepository from '../repositories/notificationRepository';
import * as preferenceRepo from '../repositories/preferenceRepository';
import * as ruleRepo from '../repositories/ruleRepository';
import { NotificationType, NotificationSeverity, NotificationSourceType, INotification } from '../models/Notification';
import { evaluateRules } from '../services/ruleEngine';
import { resolveChannels } from '../services/preferenceResolver';
import { emailQueue, EmailJob } from './queues';

const STREAMS = ['task:events', 'progress:events', 'alert:events'] as const;
const GROUP = process.env.REDIS_STREAM_CONSUMER_GROUP || 'notification-svc';
const CONSUMER = process.env.REDIS_STREAM_CONSUMER_NAME || 'notification-worker-1';
const BLOCK_MS = 5000;

type StreamEvent = Record<string, string>;

async function ensureGroups(redis: Redis): Promise<void> {
  for (const stream of STREAMS) {
    try {
      await redis.xgroup('CREATE', stream, GROUP, '$', 'MKSTREAM');
      logger.info('streamConsumer: created consumer group', { stream, group: GROUP });
    } catch (err: unknown) {
      // BUSYGROUP means group already exists — expected
      if (!(err as Error).message?.includes('BUSYGROUP')) {
        logger.warn('streamConsumer: xgroup CREATE error', { stream, error: (err as Error).message });
      }
    }
  }
}

function mapAlertEventToNotification(event: StreamEvent): Partial<import('../models/Notification').INotification> | null {
  const { alertType, taskId, teamId, severity, alertId } = event;
  if (!taskId || !alertId) return null;

  const typeMap: Record<string, NotificationType> = {
    past_due: 'past_due',
    update_overdue: 'update_overdue',
    behind_schedule: 'behind_schedule',
    stalled: 'stalled',
  };

  const type: NotificationType = typeMap[alertType] ?? 'past_due';
  const severityMap: Record<string, NotificationSeverity> = {
    low: 'low', medium: 'medium', high: 'high',
  };

  return {
    sourceType: 'alert' as NotificationSourceType,
    sourceId: alertId,
    type,
    title: `Alert: ${type.replace(/_/g, ' ')}`,
    body: event.message || `Task has a ${type.replace(/_/g, ' ')} alert`,
    severity: severityMap[severity] ?? 'medium',
    metadata: { taskId, teamId, alertType },
    // userId resolved separately per subscriber; for alert events we use assigneeId
    userId: event.assigneeId || '',
  };
}

function mapTaskEventToNotification(event: StreamEvent): Partial<import('../models/Notification').INotification> | null {
  const { type: eventType, taskId, actorId, teamId } = event;
  if (!taskId) return null;

  const typeMap: Record<string, NotificationType> = {
    'task.assigned': 'task_assigned',
    'task.status_changed': 'task_status_changed',
    'task.reassigned': 'task_reassigned',
    'task.comment.created': 'comment_added',
  };

  const type: NotificationType = typeMap[eventType];
  if (!type) return null;

  const recipientId = event.assigneeId || event.recipientId;
  if (!recipientId || recipientId === actorId) return null;

  return {
    sourceType: 'task' as NotificationSourceType,
    sourceId: taskId,
    type,
    title: buildTaskTitle(type, event),
    body: buildTaskBody(type, event),
    severity: 'low',
    actorId,
    userId: recipientId,
    metadata: { taskId, teamId, eventType },
  };
}

function buildTaskTitle(type: NotificationType, event: StreamEvent): string {
  const title = event.taskTitle || 'a task';
  switch (type) {
    case 'task_assigned': return `You were assigned to "${title}"`;
    case 'task_status_changed': return `Task status changed: "${title}"`;
    case 'task_reassigned': return `Task reassigned: "${title}"`;
    case 'comment_added': return `New comment on "${title}"`;
    default: return `Task update: "${title}"`;
  }
}

function buildTaskBody(type: NotificationType, event: StreamEvent): string {
  switch (type) {
    case 'task_status_changed':
      return `Status changed from ${event.oldStatus || '?'} to ${event.newStatus || '?'}`;
    case 'comment_added':
      return (event.commentBody || '').slice(0, 120);
    default:
      return event.message || `Task "${event.taskTitle}" was updated`;
  }
}

function mapProgressEventToNotification(event: StreamEvent): Partial<import('../models/Notification').INotification> | null {
  const { taskId, actorId, teamId, updateId } = event;
  if (!taskId || !updateId) return null;

  const recipientId = event.assigneeId || event.recipientId;
  if (!recipientId || recipientId === actorId) return null;

  return {
    sourceType: 'progress' as NotificationSourceType,
    sourceId: updateId,
    type: 'progress_updated',
    title: `Progress update on "${event.taskTitle || 'a task'}"`,
    body: `Completion: ${event.completionPct ?? '?'}%`,
    severity: 'low',
    actorId,
    userId: recipientId,
    metadata: { taskId, teamId, completionPct: event.completionPct },
  };
}

async function processEntry(stream: string, messageId: string, fields: string[]): Promise<void> {
  // Convert flat fields array to object
  const event: StreamEvent = {};
  for (let i = 0; i < fields.length - 1; i += 2) {
    event[fields[i]] = fields[i + 1];
  }

  let partial: Partial<import('../models/Notification').INotification> | null = null;

  if (stream === 'alert:events') partial = mapAlertEventToNotification(event);
  else if (stream === 'task:events') partial = mapTaskEventToNotification(event);
  else if (stream === 'progress:events') partial = mapProgressEventToNotification(event);

  if (!partial || !partial.userId) return;

  const key = notificationRepository.buildIdempotencyKey(
    partial.sourceType!,
    partial.sourceId!,
    partial.type!,
    partial.userId
  );

  const notification = await notificationRepository.create({ ...partial, idempotencyKey: key });
  if (!notification) return; // duplicate — already processed

  // Apply preference resolver + rule engine
  try {
    const [pref, rules] = await Promise.all([
      preferenceRepo.findByUser(partial.userId),
      ruleRepo.findActiveByUser(partial.userId),
    ]);

    const ruleResult = await evaluateRules(notification as INotification, rules);
    const resolved = resolveChannels(notification as INotification, pref, ruleResult);

    if (resolved.shouldSuppress) {
      logger.debug('streamConsumer: notification suppressed by rules/prefs', { userId: partial.userId });
      return;
    }

    // Queue email delivery if enabled for this user
    if (resolved.channels.includes('email')) {
      const emailJob: EmailJob = {
        notificationId: (notification._id as { toString(): string }).toString(),
        userId: partial.userId,
        to: partial.userId, // identity-service email lookup deferred to email worker
        subject: notification.title,
        html: `<p>${notification.body}</p>`,
        plainText: notification.body,
      };
      void emailQueue.add('notification-email', emailJob);
    }
  } catch (err) {
    logger.warn('streamConsumer: preference/rule resolution failed', { error: (err as Error).message });
  }

  logger.debug('streamConsumer: notification created', { stream, messageId, type: partial.type, userId: partial.userId });
}

export async function startStreamConsumer(): Promise<void> {
  const redis = getRedisClient();
  await ensureGroups(redis);
  logger.info('streamConsumer: starting', { group: GROUP, consumer: CONSUMER, streams: STREAMS });

  // Run consumer loop in background
  void consumeLoop(redis);
}

async function consumeLoop(redis: Redis): Promise<void> {
  while (true) {
    try {
      const results = await redis.xreadgroup(
        'GROUP', GROUP, CONSUMER,
        'COUNT', '10',
        'BLOCK', String(BLOCK_MS),
        'STREAMS', ...STREAMS, ...STREAMS.map(() => '>')
      ) as Array<[string, Array<[string, string[]]>]> | null;

      if (!results) continue;

      for (const [stream, entries] of results) {
        for (const [messageId, fields] of entries) {
          try {
            await processEntry(stream, messageId, fields);
            await redis.xack(stream, GROUP, messageId);
          } catch (err) {
            logger.warn('streamConsumer: failed to process entry', {
              stream, messageId, error: (err as Error).message,
            });
          }
        }
      }
    } catch (err) {
      logger.warn('streamConsumer: xreadgroup error', { error: (err as Error).message });
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}
