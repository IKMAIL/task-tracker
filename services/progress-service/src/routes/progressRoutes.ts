import { Router } from 'express';
import Joi from 'joi';
import validate from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import * as progressController from '../controllers/progressController';

const router = Router();

const STATUSES = ['not_started', 'in_progress', 'blocked', 'completed', 'cancelled'];

const logSchema = Joi.object({
  taskId:         Joi.string().required(),
  teamId:         Joi.string().required(),
  completionPct:  Joi.number().min(0).max(100).required(),
  status:         Joi.string().valid(...STATUSES).required(),
  comment:        Joi.string().max(2000).default(''),
  nextUpdateDate: Joi.date().optional().allow(null),
});

router.post('/', authenticate, validate(logSchema), progressController.log);
router.get('/task/:taskId', authenticate, progressController.getHistory);
router.get('/latest/:taskId', authenticate, progressController.getLatest);
router.get('/team/:teamId', authenticate, progressController.getTeamUpdates);

export default router;
