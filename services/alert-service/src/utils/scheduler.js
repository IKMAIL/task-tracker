const cron = require('node-cron');
const alertDetector = require('../services/alertDetector');

// Run detection daily at 06:00 UTC
module.exports = function startScheduler() {
  cron.schedule('0 6 * * *', async () => {
    console.log('Alert detection run started');
    try {
      await alertDetector.runDetection();
      console.log('Alert detection run completed');
    } catch (err) {
      console.error('Alert detection failed:', err.message);
    }
  });
  console.log('Alert scheduler started (daily at 06:00 UTC)');
};
