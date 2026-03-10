import mongoose from 'mongoose';
import { logger } from '../../../../shared/utils/src/logger';

export default async function connectDB(): Promise<void> {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI env var is required');
  await mongoose.connect(uri);
  logger.info('MongoDB connected', { uri: uri.replace(/:\/\/[^@]+@/, '://***@') });
}
