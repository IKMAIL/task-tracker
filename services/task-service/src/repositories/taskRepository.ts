import Task from '../models/Task';
import { FilterQuery } from 'mongoose';
import { ITask } from '../models/Task';

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

export const create = (data: Partial<ITask>) => Task.create(data);

export const findById = (id: string) => Task.findById(id).lean();

export const findPaginated = async (
  query: FilterQuery<ITask>,
  { page = 1, limit = 20 }: PaginationOptions = {}
): Promise<PaginatedResult> => {
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;
  const [tasks, total] = await Promise.all([
    Task.find(query).sort({ dueDate: 1 }).skip(skip).limit(limitNum).lean(),
    Task.countDocuments(query),
  ]);
  return {
    tasks: tasks as ITask[],
    meta: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
  };
};

export const findByTeam = (teamId: string) =>
  Task.find({ assignedTeamId: teamId }).sort({ dueDate: 1 }).lean();

export const updateById = (id: string, data: Partial<ITask>) =>
  Task.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).lean();

export const summary = () =>
  Task.aggregate([
    { $group: { _id: { status: '$status', category: '$category' }, count: { $sum: 1 } } },
  ]);
