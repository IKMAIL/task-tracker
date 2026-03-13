import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './src/config/db';
import progressRoutes from './src/routes/progressRoutes';
import errorHandler from './src/utils/errorHandler';
import { logger, requestLogger } from '@task-tracker/utils';

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'progress-service' }));
app.use('/progress', progressRoutes);
app.use(errorHandler);

app.listen(PORT, () => logger.info('progress-service started', { port: PORT }));
connectDB().catch((err) => {
  logger.error('MongoDB connection failed', { err });
  process.exit(1);
});
