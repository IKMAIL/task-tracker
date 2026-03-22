import TaskUpdate, { ITaskUpdate } from '../models/TaskUpdate';
import { logger } from '@task-tracker/utils';
import { publishToStream } from '../utils/streamPublisher';

export const create = async (data: Partial<ITaskUpdate>) => {
  logger.debug('progressRepository.create', { data });
  const update = await TaskUpdate.create(data);
  logger.debug('progressRepository.create result', { updateId: String(update._id) });
  void publishToStream('progress:events', {
    type: 'progress.created',
    updateId: String(update._id),
    taskId: String(update.taskId),
    teamId: String(update.teamId),
    actorId: '',
    completionPct: String(update.completionPct),
    timestamp: new Date().toISOString(),
  });
  return update;
};

export const findByTask = async (taskId: string) => {
  logger.debug('progressRepository.findByTask', { taskId });
  const updates = await TaskUpdate.find({ taskId }).sort({ recordedAt: -1 }).lean();
  logger.debug('progressRepository.findByTask result', { taskId, count: updates.length });
  return updates;
};

export const findLatestByTask = async (taskId: string) => {
  logger.debug('progressRepository.findLatestByTask', { taskId });
  const update = await TaskUpdate.findOne({ taskId }).sort({ recordedAt: -1 }).lean();
  logger.debug('progressRepository.findLatestByTask result', { taskId, found: !!update, update });
  return update;
};

export const findByTeam = async (teamId: string) => {
  logger.debug('progressRepository.findByTeam', { teamId });
  const updates = await TaskUpdate.find({ teamId }).sort({ recordedAt: -1 }).limit(100).lean();
  logger.debug('progressRepository.findByTeam result', { teamId, count: updates.length });
  return updates;
};
