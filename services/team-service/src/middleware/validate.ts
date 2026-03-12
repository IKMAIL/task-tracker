import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { logger } from '@task-tracker/utils';

export default function validate(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const errors = error.details.map((d: any) => ({ field: (d.path as (string | number)[]).join('.'), message: d.message as string }));
      logger.warn('validate: request body invalid', { method: req.method, path: req.path, errors });
      const message = errors.map((e: { message: string }) => e.message).join('; ');
      res.status(400).json({ success: false, error: { message } });
      return;
    }
    req.body = value;
    next();
  };
}
