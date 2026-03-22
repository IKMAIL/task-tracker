import Redis from 'ioredis';
import { logger } from '@task-tracker/utils';

let client: Redis | null = null;

export function getRedisClient(): Redis {
  if (!client) {
    const url = process.env.REDIS_URL || 'redis://localhost:6379';
    client = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 3 });
    client.on('error', (err) => logger.warn('Redis client error', { error: err.message }));
    client.on('connect', () => {
      try {
        const parsed = new URL(url);
        logger.info('Redis connected', { host: parsed.hostname, port: parsed.port || '6379' });
      } catch {
        logger.info('Redis connected');
      }
    });
  }
  return client;
}

export async function connectRedis(): Promise<void> {
  const redis = getRedisClient();
  await redis.connect();
}
