import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './src/config/db';
import taskRoutes from './src/routes/taskRoutes';
import importRoutes from './src/routes/importRoutes';
import errorHandler from './src/utils/errorHandler';
import { logger, requestLogger } from '@task-tracker/utils';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'task-service' }));
app.use('/tasks', taskRoutes);
app.use('/import', importRoutes);
app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => logger.info('task-service started', { port: PORT }));
});
