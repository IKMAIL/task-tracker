import cron from 'node-cron';
import { runDetection } from '../services/alertDetector';
import { logger } from '@task-tracker/utils';

export default function startScheduler(): void {
  cron.schedule('0 6 * * *', async () => {
    logger.info('scheduler: alert detection run started');
    try {
      await runDetection();
      logger.info('scheduler: alert detection run completed');
    } catch (err) {
      logger.error('scheduler: alert detection run failed', { error: (err as Error).message, stack: (err as Error).stack });
    }
  });
  logger.info('scheduler: alert scheduler registered', { schedule: '0 6 * * * (daily at 06:00 UTC)' });
}
