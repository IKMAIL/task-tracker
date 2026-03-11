import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './src/config/db';
import teamRoutes from './src/routes/teamRoutes';
import errorHandler from './src/utils/errorHandler';
import { logger, requestLogger } from '@task-tracker/utils';

const app = express();
const PORT = process.env.PORT || 3006;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'team-service' }));

app.use('/teams', teamRoutes);

app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info('team-service started', { port: PORT });
  });
});
