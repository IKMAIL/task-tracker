import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await userService.listUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}

export async function get(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.getUser(req.params.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.user?.role !== 'admin' && req.user?.sub !== req.params.id) {
      res.status(403).json({ success: false, error: { message: 'Forbidden' } });
      return;
    }
    const user = await userService.updateUser(req.params.id, req.body);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}
