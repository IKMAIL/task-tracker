import { Request, Response, NextFunction } from 'express';
import * as progressService from '../services/progressService';

export const log = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const update = await progressService.logUpdate(req.body, req.user!.sub!);
    res.status(201).json({ success: true, data: update });
  } catch (err) {
    next(err);
  }
};

export const getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updates = await progressService.getHistory(req.params.taskId);
    res.json({ success: true, data: updates });
  } catch (err) {
    next(err);
  }
};

export const getLatest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const update = await progressService.getLatest(req.params.taskId);
    res.json({ success: true, data: update });
  } catch (err) {
    next(err);
  }
};

export const getTeamUpdates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updates = await progressService.getTeamUpdates(req.params.teamId);
    res.json({ success: true, data: updates });
  } catch (err) {
    next(err);
  }
};
