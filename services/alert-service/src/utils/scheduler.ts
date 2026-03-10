import cron from 'node-cron';
import { runDetection } from '../services/alertDetector';

export default function startScheduler(): void {
  cron.schedule('0 6 * * *', async () => {
    console.log('Alert detection run started');
    try {
      await runDetection();
      console.log('Alert detection run completed');
    } catch (err) {
      console.error('Alert detection failed:', (err as Error).message);
    }
  });
  console.log('Alert scheduler started (daily at 06:00 UTC)');
}
