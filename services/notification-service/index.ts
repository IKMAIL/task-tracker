import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import connectDB from './src/config/db';
import { connectRedis } from './src/utils/redisClient';
import { startStreamConsumer, stopStreamConsumer } from './src/utils/streamConsumer';
import { initSocketServer } from './src/utils/socketServer';
import { startEmailWorker, startSnoozeWorker, closeSnoozeWorker } from './src/utils/queues';
import { startDigestWorker, enqueueDigestsForAllUsers } from './src/services/digestWorker';
import notificationRoutes from './src/routes/notificationRoutes';
import preferenceRoutes from './src/routes/preferenceRoutes';
import subscriptionRoutes from './src/routes/subscriptionRoutes';
import ruleRoutes from './src/routes/ruleRoutes';
import { errorHandler, logger, requestLogger } from '@task-tracker/utils';

const app = express();
const PORT = process.env.PORT || 3007;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:3005').split(',');
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'notification-service' }));

app.get('/health/ready', async (_req, res) => {
  try {
    const mongoose = await import('mongoose');
    const redis = (await import('./src/utils/redisClient')).getRedisClient();
    const mongoOk = mongoose.default.connection.readyState === 1;
    const redisOk = redis.status === 'ready';
    if (mongoOk && redisOk) {
      res.json({ status: 'ready', mongo: 'ok', redis: 'ok' });
    } else {
      res.status(503).json({ status: 'not ready', mongo: mongoOk ? 'ok' : 'down', redis: redisOk ? 'ok' : 'down' });
    }
  } catch (err) {
    res.status(503).json({ status: 'not ready', error: (err as Error).message });
  }
});

app.use('/notifications', notificationRoutes);
app.use('/preferences', preferenceRoutes);
app.use('/subscriptions', subscriptionRoutes);
app.use('/rules', ruleRoutes);

app.use(errorHandler);

const httpServer = http.createServer(app);

connectDB()
  .then(() => connectRedis())
  .then(() => {
    initSocketServer(httpServer);
    startEmailWorker();
    startSnoozeWorker();
    startDigestWorker();
    return startStreamConsumer();
  })
  .then(() => {
    httpServer.listen(PORT, () => {
      logger.info('notification-service started', { port: PORT });
    });
    scheduleDailyDigest();
  })
  .catch((err) => {
    logger.error('notification-service failed to start', { error: (err as Error).message });
    process.exit(1);
  });

/** Schedule enqueueDigestsForAllUsers daily at 08:00 UTC. */
function scheduleDailyDigest(): void {
  if (process.env.ENABLE_EMAIL_CHANNEL !== 'true') return;
  const now = new Date();
  const next = new Date();
  next.setUTCHours(8, 0, 0, 0);
  if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
  const delay = next.getTime() - now.getTime();
  setTimeout(() => {
    void enqueueDigestsForAllUsers();
    setInterval(() => void enqueueDigestsForAllUsers(), 24 * 60 * 60 * 1000);
  }, delay);
  logger.info('digestWorker: daily digest scheduled', { nextRunMs: delay });
}

// Graceful shutdown — close workers before exiting so in-flight jobs are not abandoned
async function shutdown(signal: string): Promise<void> {
  logger.info('notification-service: shutdown signal received', { signal });
  stopStreamConsumer();
  await closeSnoozeWorker();
  httpServer.close(() => process.exit(0));
}
process.once('SIGTERM', () => void shutdown('SIGTERM'));
process.once('SIGINT',  () => void shutdown('SIGINT'));
