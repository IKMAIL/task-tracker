import cron from 'node-cron';
import { runRecurring } from '../services/taskService';
import { logger } from '@task-tracker/utils';

export default function startScheduler(): void {
  cron.schedule('0 1 * * *', async () => {
    logger.info('scheduler: recurring task run started');
    try {
      const spawned = await runRecurring();
      logger.info('scheduler: recurring task run completed', { spawned });
    } catch (err) {
      logger.error('scheduler: recurring task run failed', { error: (err as Error).message, stack: (err as Error).stack });
    }
  });
  logger.info('scheduler: recurring task scheduler registered', { schedule: '0 1 * * * (daily at 01:00 UTC)' });
}
