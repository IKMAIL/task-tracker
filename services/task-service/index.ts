import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './src/config/db';
import taskRoutes from './src/routes/taskRoutes';
import errorHandler from './src/utils/errorHandler';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'task-service' }));
app.use('/tasks', taskRoutes);
app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => console.log(`task-service running on port ${PORT}`));
});
