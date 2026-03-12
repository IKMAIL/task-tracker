import { Request, Response, NextFunction } from 'express';
import { parseFileBuffer } from '../utils/parseFile';
import * as importService from '../services/importService';
import { logger } from '@task-tracker/utils';

export async function importTeams(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    logger.debug('importController.importTeams', { userId: req.user?.sub });
    if (!req.file) {
      res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
      return;
    }
    const rows = parseFileBuffer(req.file.buffer, req.file.originalname);
    const result = await importService.importTeams(rows);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function importMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    logger.debug('importController.importMembers', { userId: req.user?.sub });
    if (!req.file) {
      res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
      return;
    }
    const rows = parseFileBuffer(req.file.buffer, req.file.originalname);
    const result = await importService.importMembers(rows);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function importTeamMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    logger.debug('importController.importTeamMembers', { userId: req.user?.sub });
    if (!req.file) {
      res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
      return;
    }
    const rows = parseFileBuffer(req.file.buffer, req.file.originalname);
    const result = await importService.importTeamMembers(rows);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
