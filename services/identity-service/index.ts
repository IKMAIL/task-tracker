import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './src/config/db';
import authRoutes from './src/routes/authRoutes';
import userRoutes from './src/routes/userRoutes';
import apiKeyRoutes from './src/routes/apiKeyRoutes';
import internalRoutes from './src/routes/internalRoutes';

import errorHandler from './src/utils/errorHandler';
import { logger, requestLogger } from '@task-tracker/utils';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'identity-service' }));

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/api-keys', apiKeyRoutes);
app.use('/internal', internalRoutes);

app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info('identity-service started', { port: PORT });
  });
});
