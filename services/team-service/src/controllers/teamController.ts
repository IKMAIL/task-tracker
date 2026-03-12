import { Request, Response, NextFunction } from 'express';
import * as teamService from '../services/teamService';
import { logger } from '@task-tracker/utils';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    logger.debug('teamController.list', { requestedBy: req.user?.sub });
    const teams = await teamService.listTeams();
    res.json({ success: true, data: teams });
  } catch (err) {
    next(err);
  }
}

export async function get(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    logger.debug('teamController.get', { id: req.params.id, requestedBy: req.user?.sub });
    const team = await teamService.getTeam(req.params.id);
    res.json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    logger.debug('teamController.create', { body: req.body, requestedBy: req.user?.sub });
    const team = await teamService.createTeam(req.body);
    res.status(201).json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    logger.debug('teamController.update', { id: req.params.id, body: req.body, requestedBy: req.user?.sub });
    const team = await teamService.updateTeam(req.params.id, req.body);
    res.json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    logger.debug('teamController.remove', { id: req.params.id, requestedBy: req.user?.sub });
    await teamService.deleteTeam(req.params.id);
    res.json({ success: true, message: 'Team deleted' });
  } catch (err) {
    next(err);
  }
}

export async function addMember(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    logger.debug('teamController.addMember', { teamId: req.params.id, memberId: req.body.memberId, requestedBy: req.user?.sub });
    const team = await teamService.addMember(req.params.id, req.body.memberId);
    res.json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
}

export async function removeMember(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    logger.debug('teamController.removeMember', { teamId: req.params.id, memberId: req.params.memberId, requestedBy: req.user?.sub });
    const team = await teamService.removeMember(req.params.id, req.params.memberId);
    res.json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
}
