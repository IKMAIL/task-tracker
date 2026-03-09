import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function microsoftLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.microsoftLogin(req.body.idToken);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function microsoftMerge(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.mergeWithMicrosoft(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
