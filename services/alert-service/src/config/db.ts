import mongoose from 'mongoose';
import { logger } from '@task-tracker/utils';

export default async function connectDB(): Promise<void> {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI env var is required');
  await mongoose.connect(uri);
  logger.info('MongoDB connected', { uri: uri.replace(/:\/\/[^@]+@/, '://***@') });
}
