import { Request, Response, NextFunction } from 'express';
import * as memberService from '../services/memberService';
import { logger } from '@task-tracker/utils';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    logger.debug('memberController.list', { requestedBy: req.user?.sub });
    const members = await memberService.listMembers();
    res.json({ success: true, data: members });
  } catch (err) {
    next(err);
  }
}

export async function get(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    logger.debug('memberController.get', { id: req.params.id, requestedBy: req.user?.sub });
    const member = await memberService.getMember(req.params.id);
    res.json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    logger.debug('memberController.create', { body: req.body, requestedBy: req.user?.sub });
    const member = await memberService.createMember(req.body);
    res.status(201).json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    logger.debug('memberController.update', { id: req.params.id, body: req.body, requestedBy: req.user?.sub });
    const auditUser = req.user?.sub ? { userId: req.user.sub, userEmail: req.user.email as string } : undefined;
    const member = await memberService.updateMember(req.params.id, req.body, auditUser);
    res.json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    logger.debug('memberController.remove', { id: req.params.id, requestedBy: req.user?.sub });
    const auditUser = req.user?.sub ? { userId: req.user.sub, userEmail: req.user.email as string } : undefined;
    await memberService.deleteMember(req.params.id, auditUser);
    res.json({ success: true, message: 'Member deleted' });
  } catch (err) {
    next(err);
  }
}
