import { Request, Response, NextFunction } from 'express';
import * as apiKeyService from '../services/apiKeyService';
import { logger } from '@task-tracker/utils';

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.sub as string;
    logger.debug('apiKeyController.create', { userId });
    const result = await apiKeyService.createKey({ userId, name: req.body.name, expiresAt: req.body.expiresAt });
    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.sub as string;
    logger.debug('apiKeyController.list', { userId });
    const result = await apiKeyService.listKeys(userId);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function revoke(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.sub as string;
    logger.debug('apiKeyController.revoke', { keyId: req.params.id, userId });
    await apiKeyService.revokeKey(req.params.id, userId);
    res.json({ success: true, data: { message: 'API key revoked' } });
  } catch (err) { next(err); }
}

export async function validate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    logger.debug('apiKeyController.validate');
    const result = await apiKeyService.validateKey(req.body.key);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}
