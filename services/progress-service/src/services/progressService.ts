import fetch from 'node-fetch';
import * as progressRepository from '../repositories/progressRepository';
import { ITaskUpdate } from '../models/TaskUpdate';
import { logger } from '@task-tracker/utils';

interface SyncData {
  completionPct: number;
  status: string;
  lastUpdatedAt: Date;
  nextUpdateDate: Date | null;
}

const syncToTask = async (taskId: string, syncData: SyncData): Promise<void> => {
  const url = `${process.env.TASK_SERVICE_URL}/tasks/${taskId}/progress-sync`;
  logger.debug('progress-service: syncing to task-service', { taskId, syncData });
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Token': process.env.SERVICE_TOKEN as string,
      },
      body: JSON.stringify(syncData),
    });
    if (!res.ok) {
      logger.error('progress-service: task sync failed', { taskId, httpStatus: res.status });
    } else {
      logger.debug('progress-service: task sync succeeded', { taskId });
    }
  } catch (err) {
    logger.error('progress-service: task sync error', { taskId, error: (err as Error).message });
  }
};

export const logUpdate = async (dto: Partial<ITaskUpdate> & { taskId: string; completionPct: number; status: string; nextUpdateDate?: Date | null }, authorId: string) => {
  logger.debug('progressService.logUpdate', { dto, authorId });
  const update = await progressRepository.create({ ...dto, authorId: authorId as unknown as ITaskUpdate['authorId'] });
  logger.debug('progressService.logUpdate result', { update });
  logger.info('progress update logged', { taskId: dto.taskId, authorId, completionPct: dto.completionPct, status: dto.status });
  const syncData = {
    completionPct: dto.completionPct,
    status: dto.status,
    lastUpdatedAt: update.recordedAt,
    nextUpdateDate: dto.nextUpdateDate || null,
  };
  logger.debug('progressService.logUpdate: firing sync to task-service', { taskId: dto.taskId, syncData });
  syncToTask(dto.taskId, syncData);
  return update;
};

export const getHistory = async (taskId: string) => {
  logger.debug('progressService.getHistory', { taskId });
  const updates = await progressRepository.findByTask(taskId);
  logger.debug('progressService.getHistory result', { taskId, count: updates.length });
  return updates;
};

export const getLatest = async (taskId: string) => {
  logger.debug('progressService.getLatest', { taskId });
  const update = await progressRepository.findLatestByTask(taskId);
  logger.debug('progressService.getLatest result', { taskId, update });
  return update;
};

export const getTeamUpdates = async (teamId: string) => {
  logger.debug('progressService.getTeamUpdates', { teamId });
  const updates = await progressRepository.findByTeam(teamId);
  logger.debug('progressService.getTeamUpdates result', { teamId, count: updates.length });
  return updates;
};
