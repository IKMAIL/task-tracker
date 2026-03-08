require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const alertRoutes = require('./src/routes/alertRoutes');
const startScheduler = require('./src/utils/scheduler');
const errorHandler = require('./src/utils/errorHandler');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'alert-service' }));
app.use('/alerts', alertRoutes);
app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`alert-service running on port ${PORT}`);
    startScheduler();
  });
});
