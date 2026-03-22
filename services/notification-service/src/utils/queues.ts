import { Queue, Worker, Job } from 'bullmq';
import { logger } from '@task-tracker/utils';
import { getRedisClient } from './redisClient';

// Shared connection config
const connection = { host: 'localhost', port: 6379 };

function makeConnection() {
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

export const emailQueue = new Queue<EmailJob>('email-delivery', {
  connection: makeConnection(),
  defaultJobOptions: { attempts: 5, backoff: { type: 'exponential', delay: 2000 }, removeOnComplete: 100, removeOnFail: 50 },
});

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
