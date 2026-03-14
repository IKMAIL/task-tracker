import { Request, Response, NextFunction } from 'express';
import AuditLog from '../models/AuditLog';
import { logger } from '@task-tracker/utils';

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { resourceType, resourceId, actorId, since, page = '1', limit = '50' } = req.query as Record<string, string>;

    if (!resourceType && !actorId) {
      res.status(400).json({ success: false, error: { message: 'resourceType+resourceId or actorId is required' } });
      return;
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, unknown> = {};
    if (resourceType) filter.resourceType = resourceType;
    if (resourceId) filter.resourceId = resourceId;
    if (actorId) filter.userId = actorId;
    if (since) filter.timestamp = { $gte: new Date(since) };

    logger.debug('auditController.list (alert-service)', { filter, pageNum, limitNum });

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AuditLog.countDocuments(filter),
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
