import * as taskRepository from '../repositories/taskRepository';
import { ITask } from '../models/Task';
import { PaginationOptions } from '../repositories/taskRepository';
import { logger, AuditUser } from '@task-tracker/utils';

export interface TaskFilters {
  teamId?: string;
  status?: string;
  category?: string;
}

export const createTask = async (
  dto: Partial<ITask> & { dueDate: string | Date; plannedStartDate: string | Date },
  createdBy: string,
  auditUser?: AuditUser
) => {
  logger.debug('taskService.createTask', { dto, createdBy });
  if (new Date(dto.dueDate) <= new Date(dto.plannedStartDate)) {
    logger.debug('taskService.createTask: date validation failed', { dueDate: dto.dueDate, plannedStartDate: dto.plannedStartDate });
    throw Object.assign(new Error('Due date must be after planned start date'), { status: 400 });
  }
  const task = await taskRepository.create(
    { ...dto, createdBy: createdBy as unknown as ITask['createdBy'] },
    auditUser
  );
  logger.info('task created', { taskId: String(task._id), createdBy, title: dto.title });
  logger.debug('taskService.createTask result', { task });
  return task;
};

export const listTasks = async (filters: TaskFilters, pagination: PaginationOptions) => {
  logger.debug('taskService.listTasks', { filters, pagination });
  const query: Record<string, unknown> = {};
  if (filters.teamId)   query.assignedTeamId = filters.teamId;
  if (filters.status)   query.status = filters.status;
  if (filters.category) query.category = filters.category;
  logger.debug('taskService.listTasks: constructed query', { query });
  const result = await taskRepository.findPaginated(query, pagination);
  logger.debug('tasks listed', { filters, total: result.meta.total, page: result.meta.page });
  return result;
};

export const getTask = async (id: string) => {
  logger.debug('taskService.getTask', { id });
  const task = await taskRepository.findById(id);
  if (!task) {
    logger.warn('task not found', { taskId: id });
    throw Object.assign(new Error('Task not found'), { status: 404 });
  }
  logger.debug('taskService.getTask result', { task });
  return task;
};

export const updateTask = async (id: string, data: Partial<ITask>, auditUser?: AuditUser) => {
  logger.debug('taskService.updateTask', { id, data });
  const task = await taskRepository.updateById(id, data, auditUser);
  if (!task) {
    logger.warn('task not found for update', { taskId: id });
    throw Object.assign(new Error('Task not found'), { status: 404 });
  }
  logger.info('task updated', { taskId: id, data });
  logger.debug('taskService.updateTask result', { task });
  return task;
};

export const cancelTask = async (id: string, auditUser?: AuditUser) => {
  const task = await taskRepository.updateById(id, { status: 'cancelled' } as Partial<ITask>, auditUser);
  if (!task) {
    logger.warn('task not found for cancel', { taskId: id });
    throw Object.assign(new Error('Task not found'), { status: 404 });
  }
  logger.info('task cancelled', { taskId: id });
  return task;
};

export const getByTeam = async (teamId: string) => {
  logger.debug('taskService.getByTeam', { teamId });
  const tasks = await taskRepository.findByTeam(teamId);
  logger.debug('taskService.getByTeam result', { teamId, count: tasks.length });
  return tasks;
};

export const getSummary = async () => {
  logger.debug('taskService.getSummary');
  const result = await taskRepository.summary();
  logger.debug('taskService.getSummary result', { result });
  return result;
};

export const syncProgress = async (id: string, data: Partial<ITask>) => {
  logger.debug('taskService.syncProgress', { id, data });
  const task = await taskRepository.updateById(id, data);
  logger.debug('progress synced to task', { taskId: id, completionPct: data.completionPct });
  logger.debug('taskService.syncProgress result', { task });
  return task;
};
