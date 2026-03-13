import * as taskRepository from '../repositories/taskRepository';
import { ITask, IRecurrence, RecurrenceFrequency } from '../models/Task';
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

export const searchTasks = async (q: string, pagination: PaginationOptions) => {
  logger.debug('taskService.searchTasks', { q, pagination });
  if (!q || q.trim().length < 2) {
    throw Object.assign(new Error('Search query must be at least 2 characters'), { status: 400 });
  }
  const result = await taskRepository.search(q.trim(), pagination);
  logger.debug('taskService.searchTasks result', { q, total: result.meta.total });
  return result;
};

export const getDependencies = async (id: string) => {
  logger.debug('taskService.getDependencies', { id });
  const task = await taskRepository.findById(id);
  if (!task) {
    logger.warn('task not found for dependencies', { taskId: id });
    throw Object.assign(new Error('Task not found'), { status: 404 });
  }
  const blockedByIds = (task.blockedBy ?? []).map(String);
  const [blockedBy, blocking] = await Promise.all([
    taskRepository.findByIds(blockedByIds),
    taskRepository.findBlocking(id),
  ]);
  logger.debug('taskService.getDependencies result', { id, blockedByCount: blockedBy.length, blockingCount: blocking.length });
  return { blockedBy, blocking };
};

export const syncProgress = async (id: string, data: Partial<ITask>) => {
  logger.debug('taskService.syncProgress', { id, data });
  const task = await taskRepository.updateById(id, data);
  logger.debug('progress synced to task', { taskId: id, completionPct: data.completionPct });
  logger.debug('taskService.syncProgress result', { task });
  return task;
};

// ─── Recurring Tasks ──────────────────────────────────────────────────────────

export const calculateNextRunAt = (frequency: RecurrenceFrequency, interval: number, from: Date): Date => {
  const next = new Date(from);
  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + interval);
      break;
    case 'weekly':
      next.setDate(next.getDate() + interval * 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + interval);
      break;
    case 'quarterly':
      next.setMonth(next.getMonth() + interval * 3);
      break;
  }
  return next;
};

export const setRecurrence = async (
  taskId: string,
  dto: Partial<IRecurrence>,
  auditUser?: AuditUser
) => {
  logger.debug('taskService.setRecurrence', { taskId, dto });
  const task = await taskRepository.findById(taskId);
  if (!task) {
    throw Object.assign(new Error('Task not found'), { status: 404 });
  }
  if (task.parentTaskId) {
    throw Object.assign(new Error('Cannot set recurrence on a child task — configure the template instead'), { status: 400 });
  }
  const updated = await taskRepository.updateById(taskId, { recurrence: dto as IRecurrence } as Partial<ITask>, auditUser);
  logger.info('recurrence configured', { taskId, enabled: dto.enabled, frequency: dto.frequency });
  return updated;
};

export const listRecurringTasks = async (pagination: PaginationOptions) => {
  logger.debug('taskService.listRecurringTasks', { pagination });
  return taskRepository.findPaginated({ 'recurrence.enabled': true }, pagination);
};

const spawnChild = async (template: ITask, now: Date): Promise<ITask> => {
  const durationMs = new Date(template.dueDate).getTime() - new Date(template.plannedStartDate).getTime();
  const childDueDate = new Date(now.getTime() + durationMs);

  const childData: Partial<ITask> = {
    title: template.title,
    description: template.description,
    category: template.category,
    assignedTeamId: template.assignedTeamId,
    assignedPersonId: template.assignedPersonId,
    createdBy: template.createdBy,
    status: 'not_started',
    completionPct: 0,
    plannedStartDate: now,
    dueDate: childDueDate,
    nextUpdateDate: null,
    lastUpdatedAt: null,
    blockedBy: [],
    recurrence: null,
    parentTaskId: template._id as ITask['parentTaskId'],
  };

  const child = await taskRepository.create(childData);
  logger.info('recurring child task spawned', {
    templateId: String(template._id),
    childId: String(child._id),
    dueDate: childDueDate,
  });
  return child as unknown as ITask;
};

export const runRecurring = async (): Promise<number> => {
  const now = new Date();
  logger.debug('taskService.runRecurring', { now });
  const templates = await taskRepository.findDueRecurringTasks(now);
  logger.info('recurring: due templates found', { count: templates.length });

  let spawned = 0;
  for (const template of templates) {
    const rec = template.recurrence!;
    if (rec.maxOccurrences !== null && rec.occurrenceCount >= rec.maxOccurrences) {
      logger.info('recurring: max occurrences reached, disabling', { taskId: String(template._id), occurrenceCount: rec.occurrenceCount, maxOccurrences: rec.maxOccurrences });
      await taskRepository.updateRecurrenceState(String(template._id), { enabled: false });
      continue;
    }

    try {
      await spawnChild(template, now);
      const nextRunAt = calculateNextRunAt(rec.frequency, rec.interval, now);
      await taskRepository.updateRecurrenceState(String(template._id), {
        nextRunAt,
        lastRunAt: now,
        occurrenceCount: rec.occurrenceCount + 1,
      });
      spawned++;
    } catch (err) {
      logger.error('recurring: failed to spawn child task', {
        templateId: String(template._id),
        error: (err as Error).message,
      });
    }
  }

  logger.info('recurring: run complete', { spawned, total: templates.length });
  return spawned;
};
