import { Request, Response, NextFunction } from 'express';
import * as teamService from '../services/teamService';
import { logger } from '@task-tracker/utils';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    logger.debug('teamController.list', { requestedBy: req.user?.sub });
    const teams = await teamService.listTeams();
    logger.debug('teamController.list result', { count: teams.length });
    res.json({ success: true, data: teams });
  } catch (err) {
    next(err);
  }
}

export async function get(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    logger.debug('teamController.get', { id: req.params.id, requestedBy: req.user?.sub });
    const team = await teamService.getTeam(req.params.id);
    logger.debug('teamController.get result', { team });
    res.json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    logger.debug('teamController.create', { body: req.body, requestedBy: req.user?.sub });
    const team = await teamService.createTeam(req.body);
    logger.debug('teamController.create result', { team });
    res.status(201).json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
}

export async function addMember(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    logger.debug('teamController.addMember', { teamId: req.params.id, userId: req.body.userId, requestedBy: req.user?.sub });
    const team = await teamService.addMember(req.params.id, req.body.userId);
    logger.debug('teamController.addMember result', { team });
    res.json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
}

export async function removeMember(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    logger.debug('teamController.removeMember', { teamId: req.params.id, userId: req.params.userId, requestedBy: req.user?.sub });
    const team = await teamService.removeMember(req.params.id, req.params.userId);
    logger.debug('teamController.removeMember result', { team });
    res.json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
}
