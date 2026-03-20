import { Request, Response, NextFunction } from 'express';
import * as checklistService from '../services/checklistService';
import { logger } from '@task-tracker/utils';

export const createChecklist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.debug('checklistController.createChecklist', { taskId: req.params.id });
    const checklists = await checklistService.createChecklist(req.params.id, req.body.title);
    res.status(201).json({ success: true, data: checklists });
  } catch (err) { next(err); }
};

export const renameChecklist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.debug('checklistController.renameChecklist', { taskId: req.params.id, clId: req.params.clId });
    const checklists = await checklistService.renameChecklist(req.params.id, req.params.clId, req.body.title);
    res.json({ success: true, data: checklists });
  } catch (err) { next(err); }
};

export const deleteChecklist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.debug('checklistController.deleteChecklist', { taskId: req.params.id, clId: req.params.clId });
    await checklistService.deleteChecklist(req.params.id, req.params.clId);
    res.json({ success: true });
  } catch (err) { next(err); }
};

export const addItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.debug('checklistController.addItem', { taskId: req.params.id, clId: req.params.clId });
    const checklists = await checklistService.addItem(req.params.id, req.params.clId, req.body);
    res.status(201).json({ success: true, data: checklists });
  } catch (err) { next(err); }
};

export const updateItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.debug('checklistController.updateItem', { taskId: req.params.id, clId: req.params.clId, itemId: req.params.itemId });
    const checklists = await checklistService.updateItem(req.params.id, req.params.clId, req.params.itemId, req.body);
    res.json({ success: true, data: checklists });
  } catch (err) { next(err); }
};

export const deleteItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.debug('checklistController.deleteItem', { taskId: req.params.id, clId: req.params.clId, itemId: req.params.itemId });
    await checklistService.deleteItem(req.params.id, req.params.clId, req.params.itemId);
    res.json({ success: true });
  } catch (err) { next(err); }
};

export const reorderItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.debug('checklistController.reorderItems', { taskId: req.params.id, clId: req.params.clId });
    const checklists = await checklistService.reorderItems(req.params.id, req.params.clId, req.body.orderedIds);
    res.json({ success: true, data: checklists });
  } catch (err) { next(err); }
};

export const reorderSubItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.debug('checklistController.reorderSubItems', { taskId: req.params.id, clId: req.params.clId, itemId: req.params.itemId });
    const checklists = await checklistService.reorderSubItems(req.params.id, req.params.clId, req.params.itemId, req.body.orderedIds);
    res.json({ success: true, data: checklists });
  } catch (err) { next(err); }
};
