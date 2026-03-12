import { Request, Response, NextFunction } from 'express';
import { parseFileBuffer } from '../utils/parseFile';
import * as importService from '../services/importService';
import { logger } from '@task-tracker/utils';

export async function importTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    logger.debug('importController.importTasks', { userId: req.user?.sub });
    if (!req.file) {
      res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
      return;
    }

    let teamMap: Record<string, string> = {};
    if (req.body.teamMap) {
      try {
        teamMap = JSON.parse(req.body.teamMap);
      } catch {
        res.status(400).json({ success: false, error: { message: 'Invalid teamMap JSON' } });
        return;
      }
    }

    const rows = parseFileBuffer(req.file.buffer, req.file.originalname);
    const result = await importService.importTasks(rows, teamMap, req.user!.sub!);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
