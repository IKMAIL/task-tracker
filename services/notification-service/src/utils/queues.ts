import { Queue, Worker, Job } from 'bullmq';
import { logger } from '@task-tracker/utils';

// Shared connection config
const connection = { host: 'localhost', port: 6379 };

export function makeConnection() {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  try {
    const parsed = new URL(url);
    return { host: parsed.hostname, port: Number(parsed.port) || 6379 };
  } catch {
    return connection;
  }
}

export interface EmailJob {
  notificationId: string;
  userId: string;
  to: string;
  subject: string;
  html: string;
  plainText: string;
}

export interface SnoozeJob {
  notificationId: string;
  userId: string;
}

export interface DigestJob {
  userId: string;
  timezone: string;
}

export const emailQueue = new Queue<EmailJob>('email-delivery', {
  connection: makeConnection(),
  defaultJobOptions: { attempts: 5, backoff: { type: 'exponential', delay: 2000 }, removeOnComplete: 100, removeOnFail: 50 },
});

export const snoozeQueue = new Queue<SnoozeJob>('snooze-delivery', {
  connection: makeConnection(),
  defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 1000 }, removeOnComplete: 50, removeOnFail: 20 },
});

export const digestQueue = new Queue<DigestJob>('digest-delivery', {
  connection: makeConnection(),
  defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: 50, removeOnFail: 20 },
});

/**
 * Schedule a delayed snooze wake-up job.
 * Removes any existing delayed job for this notification first so that re-snoozing
 * always honours the latest wake-up time (BullMQ silently no-ops when a job with the
 * same ID already exists, so we must remove the old one explicitly).
 */
export async function scheduleSnoozeWakeup(notificationId: string, userId: string, wakeAt: Date): Promise<void> {
  const jobId = `snooze:${notificationId}`;
  // Remove previous delayed job if present (returns null when not found — safe to ignore)
  const existing = await snoozeQueue.getJob(jobId);
  if (existing) {
    await existing.remove();
  }
  const delayMs = Math.max(0, wakeAt.getTime() - Date.now());
  await snoozeQueue.add('snooze-wakeup', { notificationId, userId }, { delay: delayMs, jobId });
  logger.debug('queues: snooze job scheduled', { notificationId, delayMs });
}

export function startEmailWorker(): void {
  if (process.env.ENABLE_EMAIL_CHANNEL !== 'true') {
    logger.info('queues: email channel disabled (ENABLE_EMAIL_CHANNEL != true)');
    return;
  }

  const worker = new Worker<EmailJob>(
    'email-delivery',
    async (job: Job<EmailJob>) => {
      // Placeholder: real send logic added in Phase 3 delivery
      logger.info('emailWorker: would send email', { to: job.data.to, subject: job.data.subject });
      // TODO: integrate SendGrid/SES
    },
    { connection: makeConnection(), concurrency: 4 }
  );

  worker.on('failed', (job, err) => {
    if (job) {
      logger.warn('emailWorker: job failed', { jobId: job.id, error: err.message, attempts: job.attemptsMade });
    }
  });

  worker.on('completed', (job) => {
    logger.debug('emailWorker: job completed', { jobId: job.id });
  });
}

let snoozeWorkerInstance: Worker<SnoozeJob> | null = null;

export function startSnoozeWorker(): void {
  snoozeWorkerInstance = new Worker<SnoozeJob>(
    'snooze-delivery',
    async (job: Job<SnoozeJob>) => {
      const { notificationId, userId } = job.data;
      // Lazy-import to avoid circular dep
      const { clearSnooze } = await import('../repositories/notificationRepository');
      const { emitToUser } = await import('./socketServer');
      const notification = await clearSnooze(notificationId, userId);
      if (notification) {
        emitToUser(userId, 'notification:new', notification);
        logger.debug('snoozeWorker: notification re-delivered', { notificationId, userId });
      }
    },
    { connection: makeConnection(), concurrency: 10 }
  );

  snoozeWorkerInstance.on('failed', (job, err) => {
    if (job) {
      logger.warn('snoozeWorker: job failed', { jobId: job.id, error: err.message });
    }
  });
}

/** Close the snooze worker gracefully (call during process shutdown). */
export async function closeSnoozeWorker(): Promise<void> {
  if (snoozeWorkerInstance) {
    await snoozeWorkerInstance.close();
    snoozeWorkerInstance = null;
  }
}
