import { Request, Response, NextFunction } from 'express';
import * as commentService from '../services/commentService';
import { logger } from '@task-tracker/utils';

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.debug('commentController.list', { taskId: req.params.id, userId: req.user?.sub });
    const comments = await commentService.getComments(req.params.id);
    res.json({ success: true, data: comments });
  } catch (err) {
    next(err);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.debug('commentController.create', { taskId: req.params.id, userId: req.user?.sub });
    const comment = await commentService.addComment(
      req.params.id,
      req.user!.sub!,
      req.user!.email as string,
      req.body.body
    );
    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    next(err);
  }
};
