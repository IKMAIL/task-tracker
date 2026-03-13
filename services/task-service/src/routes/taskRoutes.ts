import { Router } from 'express';
import Joi from 'joi';
import validate from '../middleware/validate';
import { authenticate, requireAdmin, requireServiceToken } from '../middleware/authenticate';
import * as taskController from '../controllers/taskController';

const router: Router = Router();

const CATEGORIES = [
  'Automation Testing Coverage',
  'DR Dry Run',
  'Active-Active Setup',
  'LEAP Framework Adherence',
  'Claude Code Adoption %',
  'Open Operational Items',
  'Security Risk Items',
];
const STATUSES = ['not_started', 'in_progress', 'blocked', 'completed', 'cancelled'];

const createSchema = Joi.object({
  title:            Joi.string().min(3).max(200).required(),
  description:      Joi.string().max(2000).default(''),
  category:         Joi.string().valid(...CATEGORIES).required(),
  assignedTeamId:   Joi.string().required(),
  assignedPersonId: Joi.string().optional(),
  status:           Joi.string().valid(...STATUSES).default('not_started'),
  completionPct:    Joi.number().min(0).max(100).default(0),
  plannedStartDate: Joi.date().required(),
  dueDate:          Joi.date().required(),
  nextUpdateDate:   Joi.date().optional(),
});

const updateSchema = Joi.object({
  title:            Joi.string().min(3).max(200),
  description:      Joi.string().max(2000),
  category:         Joi.string().valid(...CATEGORIES),
  assignedTeamId:   Joi.string(),
  assignedPersonId: Joi.string().allow(null),
  status:           Joi.string().valid(...STATUSES),
  completionPct:    Joi.number().min(0).max(100),
  plannedStartDate: Joi.date(),
  dueDate:          Joi.date(),
  nextUpdateDate:   Joi.date().allow(null),
});

router.get('/summary', authenticate, taskController.summary);
router.get('/search', authenticate, taskController.search);
router.get('/team/:teamId', authenticate, taskController.getByTeam);
router.get('/', authenticate, taskController.list);
router.post('/', authenticate, validate(createSchema), taskController.create);
router.get('/:id', authenticate, taskController.get);
router.put('/:id', authenticate, validate(updateSchema), taskController.update);
router.delete('/:id', authenticate, requireAdmin, taskController.remove);
router.put('/:id/progress-sync', requireServiceToken, taskController.progressSync);

export default router;
