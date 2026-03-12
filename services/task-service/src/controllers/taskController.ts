import { Request, Response, NextFunction } from 'express';
import * as taskService from '../services/taskService';
import { logger } from '@task-tracker/utils';

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.debug('taskController.create', { body: req.body, userId: req.user?.sub });
    const auditUser = req.user?.sub ? { userId: req.user.sub, userEmail: req.user.email } : undefined;
    const task = await taskService.createTask(req.body, req.user!.sub!, auditUser);
    logger.debug('taskController.create result', { task });
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { teamId, status, category, page, limit } = req.query as Record<string, string>;
    logger.debug('taskController.list', { teamId, status, category, page, limit, userId: req.user?.sub });
    const result = await taskService.listTasks({ teamId, status, category }, { page, limit });
    logger.debug('taskController.list result', { meta: result.meta });
    res.json({ success: true, data: result.tasks, meta: result.meta });
  } catch (err) {
    next(err);
  }
};

export const get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.debug('taskController.get', { id: req.params.id, userId: req.user?.sub });
    const task = await taskService.getTask(req.params.id);
    logger.debug('taskController.get result', { task });
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.debug('taskController.update', { id: req.params.id, body: req.body, userId: req.user?.sub });
    const auditUser = req.user?.sub ? { userId: req.user.sub, userEmail: req.user.email } : undefined;
    const task = await taskService.updateTask(req.params.id, req.body, auditUser);
    logger.debug('taskController.update result', { task });
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.debug('taskController.remove', { id: req.params.id, userId: req.user?.sub });
    const auditUser = req.user?.sub ? { userId: req.user.sub, userEmail: req.user.email } : undefined;
    await taskService.cancelTask(req.params.id, auditUser);
    logger.debug('taskController.remove done', { id: req.params.id });
    res.json({ success: true, data: { message: 'Task cancelled' } });
  } catch (err) {
    next(err);
  }
};

export const getByTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.debug('taskController.getByTeam', { teamId: req.params.teamId, userId: req.user?.sub });
    const tasks = await taskService.getByTeam(req.params.teamId);
    logger.debug('taskController.getByTeam result', { teamId: req.params.teamId, count: (tasks as unknown[]).length });
    res.json({ success: true, data: tasks });
  } catch (err) {
    next(err);
  }
};

export const summary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.debug('taskController.summary', { userId: req.user?.sub });
    const data = await taskService.getSummary();
    logger.debug('taskController.summary result', { data });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const progressSync = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.debug('taskController.progressSync', { id: req.params.id, body: req.body });
    const task = await taskService.syncProgress(req.params.id, req.body);
    logger.debug('taskController.progressSync result', { task });
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};
