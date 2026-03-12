import { Request, Response, NextFunction } from 'express';
import AuditLog from '../models/AuditLog';
import { logger } from '@task-tracker/utils';

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { resourceType, resourceId, page = '1', limit = '50' } = req.query as Record<string, string>;

    if (!resourceType || !resourceId) {
      res.status(400).json({ success: false, error: { message: 'resourceType and resourceId are required' } });
      return;
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    logger.debug('auditController.list', { resourceType, resourceId, pageNum, limitNum });

    const [logs, total] = await Promise.all([
      AuditLog.find({ resourceType, resourceId })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AuditLog.countDocuments({ resourceType, resourceId }),
    ]);

    res.json({
      success: true,
      data: logs,
      meta: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
};
