import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService';
import { logger } from '@task-tracker/utils';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    logger.debug('userController.list', { requestedBy: req.user?.sub });
    const users = await userService.listUsers();
    logger.debug('userController.list result', { count: users.length });
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}

export async function get(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    logger.debug('userController.get', { id: req.params.id, requestedBy: req.user?.sub });
    const user = await userService.getUser(req.params.id);
    logger.debug('userController.get result', { user });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    logger.debug('userController.update', { id: req.params.id, body: req.body, requestedBy: req.user?.sub });
    if (req.user?.role !== 'admin' && req.user?.sub !== req.params.id) {
      logger.debug('userController.update forbidden', { requestedBy: req.user?.sub, targetId: req.params.id });
      res.status(403).json({ success: false, error: { message: 'Forbidden' } });
      return;
    }
    const user = await userService.updateUser(req.params.id, req.body);
    logger.debug('userController.update result', { user });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}
