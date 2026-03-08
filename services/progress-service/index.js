require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const progressRoutes = require('./src/routes/progressRoutes');
const errorHandler = require('./src/utils/errorHandler');

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
