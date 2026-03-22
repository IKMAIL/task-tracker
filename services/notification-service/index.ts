import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import connectDB from './src/config/db';
import { connectRedis } from './src/utils/redisClient';
import { startStreamConsumer } from './src/utils/streamConsumer';
import { initSocketServer } from './src/utils/socketServer';
import { startEmailWorker } from './src/utils/queues';
import notificationRoutes from './src/routes/notificationRoutes';
import preferenceRoutes from './src/routes/preferenceRoutes';
import subscriptionRoutes from './src/routes/subscriptionRoutes';
import { errorHandler, logger, requestLogger } from '@task-tracker/utils';

const app = express();
const PORT = process.env.PORT || 3007;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'notification-service' }));

app.use('/notifications', notificationRoutes);
app.use('/preferences', preferenceRoutes);
app.use('/subscriptions', subscriptionRoutes);

app.use(errorHandler);

const httpServer = http.createServer(app);

connectDB()
  .then(() => connectRedis())
  .then(() => {
    initSocketServer(httpServer);
    startEmailWorker();
    return startStreamConsumer();
  })
  .then(() => {
    httpServer.listen(PORT, () => {
      logger.info('notification-service started', { port: PORT });
    });
  })
  .catch((err) => {
    logger.error('notification-service failed to start', { error: (err as Error).message });
    process.exit(1);
  });
