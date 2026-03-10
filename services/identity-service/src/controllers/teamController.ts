import { Request, Response, NextFunction } from 'express';
import * as teamService from '../services/teamService';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const teams = await teamService.listTeams();
    res.json({ success: true, data: teams });
  } catch (err) {
    next(err);
  }
}

export async function get(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const team = await teamService.getTeam(req.params.id);
    res.json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const team = await teamService.createTeam(req.body);
    res.status(201).json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
}

export async function addMember(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const team = await teamService.addMember(req.params.id, req.body.userId);
    res.json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
}

export async function removeMember(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const team = await teamService.removeMember(req.params.id, req.params.userId);
    res.json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
}
