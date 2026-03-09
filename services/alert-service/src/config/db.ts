import mongoose from 'mongoose';

export default async function connectDB(): Promise<void> {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI env var is required');
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}
