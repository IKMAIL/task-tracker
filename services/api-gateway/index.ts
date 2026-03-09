import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { authenticate } from './src/middleware/authenticate';
import { createProxy } from './src/utils/proxy';
import services from './src/config/services';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(rateLimit({ windowMs: 60 * 1000, max: 200 }));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'api-gateway' }));

app.use('/api/auth',
  createProxy(services.IDENTITY_URL, { '^/api/auth': '/auth' })
);

app.use('/api/users',
  authenticate,
  createProxy(services.IDENTITY_URL, { '^/api/users': '/users' })
);

app.use('/api/teams',
  authenticate,
  createProxy(services.IDENTITY_URL, { '^/api/teams': '/teams' })
);

app.use('/api/tasks',
  authenticate,
  createProxy(services.TASK_URL, { '^/api/tasks': '/tasks' })
);

app.use('/api/progress',
  authenticate,
  createProxy(services.PROGRESS_URL, { '^/api/progress': '/progress' })
);

app.use('/api/alerts',
  authenticate,
  createProxy(services.ALERT_URL, { '^/api/alerts': '/alerts' })
);

app.use((_req, res) => {
  res.status(404).json({ success: false, error: { message: 'Route not found' } });
});

app.listen(PORT, () => {
  console.log(`api-gateway running on port ${PORT}`);
});
