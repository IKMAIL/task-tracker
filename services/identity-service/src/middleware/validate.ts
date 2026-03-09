import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

export default function validate(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const message = error.details.map((d) => d.message).join('; ');
      res.status(400).json({ success: false, error: { message } });
      return;
    }
    req.body = value;
    next();
  };
}
