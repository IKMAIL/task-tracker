require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const authenticate = require('./src/middleware/authenticate');
const { createProxy } = require('./src/utils/proxy');
const services = require('./src/config/services');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Global rate limiter — 200 requests per minute per IP
app.use(rateLimit({ windowMs: 60 * 1000, max: 200 }));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'api-gateway' }));

// Auth routes — no JWT required (login/register)
app.use('/api/auth',
  createProxy(services.IDENTITY_URL, { '^/api/auth': '/auth' })
);

// Protected routes — JWT checked at gateway before forwarding
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

// 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, error: { message: 'Route not found' } });
});

app.listen(PORT, () => {
  console.log(`api-gateway running on port ${PORT}`);
});
