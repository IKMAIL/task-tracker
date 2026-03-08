require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const teamRoutes = require('./src/routes/teamRoutes');
const errorHandler = require('./src/utils/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'identity-service' }));

// Routes
app.use('/auth',  authRoutes);
app.use('/users', userRoutes);
app.use('/teams', teamRoutes);

// Global error handler
app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`identity-service running on port ${PORT}`);
  });
});
