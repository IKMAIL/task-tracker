import * as taskRepository from '../repositories/taskRepository';
import { ITask } from '../models/Task';
import { PaginationOptions } from '../repositories/taskRepository';
import { logger } from '@task-tracker/utils';

export interface TaskFilters {
  teamId?: string;
  status?: string;
  category?: string;
}

export const createTask = async (dto: Partial<ITask> & { dueDate: string | Date; plannedStartDate: string | Date }, createdBy: string) => {
  if (new Date(dto.dueDate) <= new Date(dto.plannedStartDate)) {
    throw Object.assign(new Error('Due date must be after planned start date'), { status: 400 });
  }
  const task = await taskRepository.create({ ...dto, createdBy: createdBy as unknown as ITask['createdBy'] });
  logger.info('task created', { taskId: String(task._id), createdBy, title: dto.title });
  return task;
};

export const listTasks = async (filters: TaskFilters, pagination: PaginationOptions) => {
  const query: Record<string, unknown> = {};
  if (filters.teamId)   query.assignedTeamId = filters.teamId;
  if (filters.status)   query.status = filters.status;
  if (filters.category) query.category = filters.category;
  const result = await taskRepository.findPaginated(query, pagination);
  logger.debug('tasks listed', { filters, total: result.meta.total, page: result.meta.page });
  return result;
};

export const getTask = async (id: string) => {
  const task = await taskRepository.findById(id);
  if (!task) {
    logger.warn('task not found', { taskId: id });
    throw Object.assign(new Error('Task not found'), { status: 404 });
  }
  return task;
};

export const updateTask = async (id: string, data: Partial<ITask>) => {
  const task = await taskRepository.updateById(id, data);
  if (!task) {
    logger.warn('task not found for update', { taskId: id });
    throw Object.assign(new Error('Task not found'), { status: 404 });
  }
  logger.info('task updated', { taskId: id, fields: Object.keys(data) });
  return task;
};

export const cancelTask = async (id: string) => {
  const task = await taskRepository.updateById(id, { status: 'cancelled' } as Partial<ITask>);
  if (!task) {
    logger.warn('task not found for cancel', { taskId: id });
    throw Object.assign(new Error('Task not found'), { status: 404 });
  }
  logger.info('task cancelled', { taskId: id });
  return task;
};

export const getByTeam = (teamId: string) => taskRepository.findByTeam(teamId);

export const getSummary = () => taskRepository.summary();

export const syncProgress = async (id: string, data: Partial<ITask>) => {
  const task = await taskRepository.updateById(id, data);
  logger.debug('progress synced to task', { taskId: id, completionPct: data.completionPct });
  return task;
};
