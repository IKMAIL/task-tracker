import Task from '../models/Task';
import { FilterQuery } from 'mongoose';
import { ITask, IRecurrence } from '../models/Task';
import { logger, AuditUser } from '@task-tracker/utils';
import { publishToStream } from '../utils/streamPublisher';

export interface PaginationOptions {
  page?: number | string;
  limit?: number | string;
}

export interface PaginatedResult {
  tasks: ITask[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const create = async (data: Partial<ITask>, auditUser?: AuditUser) => {
  logger.debug('taskRepository.create', { data });
  const doc = new Task(data);
  if (auditUser) {
    doc.$locals._auditUser = auditUser;
  }
  const task = await doc.save();
  logger.debug('taskRepository.create result', { taskId: String(task._id) });
  void publishToStream('task:events', {
    type: 'task.created', taskId: String(task._id),
    teamId: String(task.assignedTeamId || ''), actorId: auditUser?.userId || '',
    assigneeId: String(task.assignedPersonId || ''),
    taskTitle: task.title || '', timestamp: new Date().toISOString(),
  });
  return task;
};

export const findById = async (id: string) => {
  logger.debug('taskRepository.findById', { id });
  const task = await Task.findById(id).lean();
  logger.debug('taskRepository.findById result', { id, found: !!task, task });
  return task;
};

export const findPaginated = async (
  query: FilterQuery<ITask>,
  { page = 1, limit = 20 }: PaginationOptions = {}
): Promise<PaginatedResult> => {
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;
  logger.debug('taskRepository.findPaginated', { query, page: pageNum, limit: limitNum, skip });
  const [tasks, total] = await Promise.all([
    Task.find(query).sort({ dueDate: 1 }).skip(skip).limit(limitNum).lean(),
    Task.countDocuments(query),
  ]);
  const result = {
    tasks: tasks as unknown as ITask[],
    meta: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
  };
  logger.debug('taskRepository.findPaginated result', { total, page: pageNum, limit: limitNum, returned: tasks.length });
  return result;
};

export const findByTeam = async (teamId: string) => {
  logger.debug('taskRepository.findByTeam', { teamId });
  const tasks = await Task.find({ assignedTeamId: teamId }).sort({ dueDate: 1 }).lean();
  logger.debug('taskRepository.findByTeam result', { teamId, count: tasks.length });
  return tasks;
};

export const updateById = async (id: string, data: Partial<ITask>, auditUser?: AuditUser, auditReason?: string) => {
  logger.debug('taskRepository.updateById', { id, data });
  const task = await Task.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true, ...(auditUser ? { auditUser } : {}), ...(auditReason ? { auditReason } : {}) }
  ).lean();
  logger.debug('taskRepository.updateById result', { id, found: !!task, task });
  if (task) {
    const t = task as unknown as ITask;
    const eventType = data.status ? 'task.status_changed'
      : data.assignedPersonId !== undefined ? 'task.assigned'
      : 'task.updated';
    void publishToStream('task:events', {
      type: eventType, taskId: id,
      teamId: String(t.assignedTeamId || ''),
      actorId: auditUser?.userId || '',
      assigneeId: String(t.assignedPersonId || ''),
      taskTitle: t.title || '',
      newStatus: data.status || '',
      timestamp: new Date().toISOString(),
    });
  }
  return task;
};

export const search = async (q: string, options: PaginationOptions = {}): Promise<PaginatedResult> => {
  const regex = new RegExp(q, 'i');
  const query: FilterQuery<ITask> = { $or: [{ title: regex }, { description: regex }] };
  logger.debug('taskRepository.search', { q, options });
  return findPaginated(query, options);
};

export const summary = async () => {
  logger.debug('taskRepository.summary');
  const result = await Task.aggregate([
    { $group: { _id: { status: '$status', category: '$category' }, count: { $sum: 1 } } },
  ]);
  logger.debug('taskRepository.summary result', { groups: result.length, result });
  return result;
};

export const findByIds = async (ids: string[]) => {
  logger.debug('taskRepository.findByIds', { ids });
  const tasks = await Task.find({ _id: { $in: ids } }).lean();
  logger.debug('taskRepository.findByIds result', { count: tasks.length });
  return tasks;
};

export const findBlocking = async (taskId: string) => {
  logger.debug('taskRepository.findBlocking', { taskId });
  const tasks = await Task.find({ blockedBy: taskId }).lean();
  logger.debug('taskRepository.findBlocking result', { taskId, count: tasks.length });
  return tasks;
};

export const findDueRecurringTasks = async (now: Date): Promise<ITask[]> => {
  logger.debug('taskRepository.findDueRecurringTasks', { now });
  const tasks = await Task.find({
    'recurrence.enabled': true,
    'recurrence.nextRunAt': { $lte: now },
    $or: [
      { 'recurrence.endDate': null },
      { 'recurrence.endDate': { $gt: now } },
    ],
  }).lean();
  logger.debug('taskRepository.findDueRecurringTasks result', { count: tasks.length });
  return tasks as unknown as ITask[];
};

export const updateRecurrenceState = async (id: string, patch: Partial<IRecurrence>) => {
  logger.debug('taskRepository.updateRecurrenceState', { id, patch });
  const update = Object.fromEntries(
    Object.entries(patch).map(([k, v]) => [`recurrence.${k}`, v])
  );
  const task = await Task.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
  logger.debug('taskRepository.updateRecurrenceState result', { id, found: !!task });
  return task;
};
