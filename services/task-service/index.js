require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const taskRoutes = require('./src/routes/taskRoutes');
const errorHandler = require('./src/utils/errorHandler');

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
