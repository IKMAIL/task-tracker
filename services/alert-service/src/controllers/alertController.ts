import { Request, Response, NextFunction } from 'express';
import * as alertService from '../services/alertService';
import * as alertDetector from '../services/alertDetector';
import { logger } from '@task-tracker/utils';

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { teamId, type, severity } = req.query as { teamId?: string; type?: string; severity?: string };
    const alerts = await alertService.listAlerts({ teamId, type: type as any, severity: severity as any });
    res.json({ success: true, data: alerts });
  } catch (err) {
    next(err);
  }
};

export const getByTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const alerts = await alertService.listAlerts({ teamId: req.params.teamId });
    res.json({ success: true, data: alerts });
  } catch (err) {
    next(err);
  }
};

export const get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const alert = await alertService.getAlert(req.params.id);
    res.json({ success: true, data: alert });
  } catch (err) {
    next(err);
  }
};

export const resolve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const alert = await alertService.resolveAlert(req.params.id);
    res.json({ success: true, data: alert });
  } catch (err) {
    next(err);
  }
};

export const runDetection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.info('alert-controller: manual detection triggered', { userId: req.user?.sub });
    alertDetector.runDetection().catch((err: Error) => logger.error('alert-controller: background detection failed', { error: err.message, stack: err.stack }));
    res.json({ success: true, data: { message: 'Detection started' } });
  } catch (err) {
    next(err);
  }
};
