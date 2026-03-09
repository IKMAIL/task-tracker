import fetch from 'node-fetch';
import * as progressRepository from '../repositories/progressRepository';
import { ITaskUpdate } from '../models/TaskUpdate';

interface SyncData {
  completionPct: number;
  status: string;
  lastUpdatedAt: Date;
  nextUpdateDate: Date | null;
}

const syncToTask = async (taskId: string, syncData: SyncData): Promise<void> => {
  const url = `${process.env.TASK_SERVICE_URL}/tasks/${taskId}/progress-sync`;
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
      console.error(`Task sync failed for ${taskId}: HTTP ${res.status}`);
    }
  } catch (err) {
    console.error(`Task sync error for ${taskId}:`, (err as Error).message);
  }
};

export const logUpdate = async (dto: Partial<ITaskUpdate> & { taskId: string; completionPct: number; status: string; nextUpdateDate?: Date | null }, authorId: string) => {
  const update = await progressRepository.create({ ...dto, authorId: authorId as unknown as ITaskUpdate['authorId'] });
  syncToTask(dto.taskId, {
    completionPct: dto.completionPct,
    status: dto.status,
    lastUpdatedAt: update.recordedAt,
    nextUpdateDate: dto.nextUpdateDate || null,
  });
  return update;
};

export const getHistory = (taskId: string) => progressRepository.findByTask(taskId);

export const getLatest = (taskId: string) => progressRepository.findLatestByTask(taskId);

export const getTeamUpdates = (teamId: string) => progressRepository.findByTeam(teamId);
