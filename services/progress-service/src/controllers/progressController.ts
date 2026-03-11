import { Request, Response, NextFunction } from 'express';
import * as progressService from '../services/progressService';
import { logger } from '@task-tracker/utils';

export const log = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.debug('progressController.log', { body: req.body, userId: req.user?.sub });
    const update = await progressService.logUpdate(req.body, req.user!.sub!);
    logger.debug('progressController.log result', { update });
    res.status(201).json({ success: true, data: update });
  } catch (err) {
    next(err);
  }
};

export const getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.debug('progressController.getHistory', { taskId: req.params.taskId, userId: req.user?.sub });
    const updates = await progressService.getHistory(req.params.taskId);
    logger.debug('progressController.getHistory result', { taskId: req.params.taskId, count: (updates as unknown[]).length });
    res.json({ success: true, data: updates });
  } catch (err) {
    next(err);
  }
};

export const getLatest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.debug('progressController.getLatest', { taskId: req.params.taskId, userId: req.user?.sub });
    const update = await progressService.getLatest(req.params.taskId);
    logger.debug('progressController.getLatest result', { taskId: req.params.taskId, update });
    res.json({ success: true, data: update });
  } catch (err) {
    next(err);
  }
};

export const getTeamUpdates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.debug('progressController.getTeamUpdates', { teamId: req.params.teamId, userId: req.user?.sub });
    const updates = await progressService.getTeamUpdates(req.params.teamId);
    logger.debug('progressController.getTeamUpdates result', { teamId: req.params.teamId, count: (updates as unknown[]).length });
    res.json({ success: true, data: updates });
  } catch (err) {
    next(err);
  }
};
