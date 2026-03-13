import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import { logger } from '@task-tracker/utils';

export async function microsoftLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    logger.debug('authController.microsoftLogin');
    const result = await authService.microsoftLogin(req.body.idToken);
    logger.debug('authController.microsoftLogin result', { result });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
