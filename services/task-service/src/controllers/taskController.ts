import { Request, Response, NextFunction } from 'express';
import * as taskService from '../services/taskService';

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const task = await taskService.createTask(req.body, req.user!.sub!);
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { teamId, status, category, page, limit } = req.query as Record<string, string>;
    const result = await taskService.listTasks({ teamId, status, category }, { page, limit });
    res.json({ success: true, data: result.tasks, meta: result.meta });
  } catch (err) {
    next(err);
  }
};

export const get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const task = await taskService.getTask(req.params.id);
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body);
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await taskService.cancelTask(req.params.id);
    res.json({ success: true, data: { message: 'Task cancelled' } });
  } catch (err) {
    next(err);
  }
};

export const getByTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tasks = await taskService.getByTeam(req.params.teamId);
    res.json({ success: true, data: tasks });
  } catch (err) {
    next(err);
  }
};

export const summary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await taskService.getSummary();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const progressSync = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const task = await taskService.syncProgress(req.params.id, req.body);
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};
