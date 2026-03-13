import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './src/config/db';
import authRoutes from './src/routes/authRoutes';
import userRoutes from './src/routes/userRoutes';

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


app.use(errorHandler);

app.listen(PORT, () => {
  logger.info('identity-service started', { port: PORT });
});
connectDB().catch((err) => {
  logger.error('MongoDB connection failed', { err });
  process.exit(1);
});
