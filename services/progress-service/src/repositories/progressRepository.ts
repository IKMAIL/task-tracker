import TaskUpdate, { ITaskUpdate } from '../models/TaskUpdate';

export const create = (data: Partial<ITaskUpdate>) => TaskUpdate.create(data);

export const findByTask = (taskId: string) =>
  TaskUpdate.find({ taskId }).sort({ recordedAt: -1 }).lean();

export const findLatestByTask = (taskId: string) =>
  TaskUpdate.findOne({ taskId }).sort({ recordedAt: -1 }).lean();

export const findByTeam = (teamId: string) =>
  TaskUpdate.find({ teamId }).sort({ recordedAt: -1 }).limit(100).lean();
