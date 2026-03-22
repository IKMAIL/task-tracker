import Redis from 'ioredis';
import { logger } from '@task-tracker/utils';

let redis: Redis | null = null;

function getClient(): Redis {
  if (!redis) {
    const url = process.env.REDIS_URL;
    if (!url) return null as unknown as Redis;
    redis = new Redis(url, { lazyConnect: false, maxRetriesPerRequest: 1, enableOfflineQueue: false });
    redis.on('error', (err) => logger.warn('streamPublisher: redis error', { error: err.message }));
  }
  return redis;
}

export async function publishToStream(stream: string, fields: Record<string, string>): Promise<void> {
  const client = getClient();
  if (!client) return;
  try {
    await client.xadd(stream, '*', ...Object.entries(fields).flat());
  } catch (err) {
    logger.warn('streamPublisher: xadd failed', { stream, error: (err as Error).message });
  }
}
