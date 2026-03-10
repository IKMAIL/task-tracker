import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import { logger } from '@task-tracker/utils';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    logger.debug('authController.register', { body: { ...req.body, password: '[REDACTED]' } });
    const user = await authService.register(req.body);
    logger.debug('authController.register result', { user });
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    logger.debug('authController.login', { email: req.body.email });
    const result = await authService.login(req.body);
    logger.debug('authController.login result', { userId: result.user.id, email: result.user.email });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

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

export async function microsoftMerge(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    logger.debug('authController.microsoftMerge', { body: { ...req.body, password: '[REDACTED]' } });
    const result = await authService.mergeWithMicrosoft(req.body);
    logger.debug('authController.microsoftMerge result', { userId: result.user.id, email: result.user.email });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
