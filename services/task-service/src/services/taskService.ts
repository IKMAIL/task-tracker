import * as taskRepository from '../repositories/taskRepository';
import { ITask } from '../models/Task';
import { PaginationOptions } from '../repositories/taskRepository';

export interface TaskFilters {
  teamId?: string;
  status?: string;
  category?: string;
}

export const createTask = async (dto: Partial<ITask> & { dueDate: string | Date; plannedStartDate: string | Date }, createdBy: string) => {
  if (new Date(dto.dueDate) <= new Date(dto.plannedStartDate)) {
    throw Object.assign(new Error('Due date must be after planned start date'), { status: 400 });
  }
  return taskRepository.create({ ...dto, createdBy: createdBy as unknown as ITask['createdBy'] });
};

export const listTasks = async (filters: TaskFilters, pagination: PaginationOptions) => {
  const query: Record<string, unknown> = {};
  if (filters.teamId)   query.assignedTeamId = filters.teamId;
  if (filters.status)   query.status = filters.status;
  if (filters.category) query.category = filters.category;
  return taskRepository.findPaginated(query, pagination);
};

export const getTask = async (id: string) => {
  const task = await taskRepository.findById(id);
  if (!task) throw Object.assign(new Error('Task not found'), { status: 404 });
  return task;
};

export const updateTask = async (id: string, data: Partial<ITask>) => {
  const task = await taskRepository.updateById(id, data);
  if (!task) throw Object.assign(new Error('Task not found'), { status: 404 });
  return task;
};

export const cancelTask = async (id: string) => {
  const task = await taskRepository.updateById(id, { status: 'cancelled' } as Partial<ITask>);
  if (!task) throw Object.assign(new Error('Task not found'), { status: 404 });
  return task;
};

export const getByTeam = (teamId: string) => taskRepository.findByTeam(teamId);

export const getSummary = () => taskRepository.summary();

export const syncProgress = (id: string, data: Partial<ITask>) =>
  taskRepository.updateById(id, data);
