import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './src/config/db';
import alertRoutes from './src/routes/alertRoutes';
import startScheduler from './src/utils/scheduler';
import errorHandler from './src/utils/errorHandler';
import { logger, requestLogger } from '@task-tracker/utils';

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'alert-service' }));
app.use('/alerts', alertRoutes);
app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info('alert-service started', { port: PORT });
    startScheduler();
  });
});
