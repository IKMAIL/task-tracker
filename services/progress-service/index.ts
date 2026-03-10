import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './src/config/db';
import progressRoutes from './src/routes/progressRoutes';
import errorHandler from './src/utils/errorHandler';

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'progress-service' }));
app.use('/progress', progressRoutes);
app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => console.log(`progress-service running on port ${PORT}`));
});
