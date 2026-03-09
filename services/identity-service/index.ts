import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './src/config/db';
import authRoutes from './src/routes/authRoutes';
import userRoutes from './src/routes/userRoutes';
import teamRoutes from './src/routes/teamRoutes';
import errorHandler from './src/utils/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'identity-service' }));

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/teams', teamRoutes);

app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`identity-service running on port ${PORT}`);
  });
});
