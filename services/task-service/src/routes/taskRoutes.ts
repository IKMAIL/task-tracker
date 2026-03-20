import { Router } from 'express';
import Joi from 'joi';
import validate from '../middleware/validate';
import { authenticate, requireAdmin, requireServiceToken } from '../middleware/authenticate';
import * as taskController from '../controllers/taskController';
import * as commentController from '../controllers/commentController';
import * as checklistController from '../controllers/checklistController';

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
const RECURRENCE_FREQUENCIES = ['daily', 'weekly', 'monthly', 'quarterly'];

const recurrenceSchema = Joi.object({
  enabled:        Joi.boolean().required(),
  frequency:      Joi.string().valid(...RECURRENCE_FREQUENCIES).when('enabled', { is: true, then: Joi.required() }),
  interval:       Joi.number().integer().min(1).max(365).default(1),
  nextRunAt:      Joi.date().when('enabled', { is: true, then: Joi.required() }),
  endDate:        Joi.date().allow(null).optional(),
  maxOccurrences: Joi.number().integer().min(1).allow(null).optional(),
});

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
  recurrence:       recurrenceSchema.optional(),
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
  blockedBy:        Joi.array().items(Joi.string().length(24)).default([]),
});

const commentSchema = Joi.object({
  body: Joi.string().min(1).max(2000).required(),
});

router.get('/summary', authenticate, taskController.summary);
router.get('/search', authenticate, taskController.search);
router.get('/recurring', authenticate, taskController.listRecurring);
router.post('/recurring/run', requireServiceToken, taskController.triggerRecurring);
router.get('/team/:teamId', authenticate, taskController.getByTeam);
router.get('/', authenticate, taskController.list);
router.post('/', authenticate, validate(createSchema), taskController.create);
router.get('/:id/comments', authenticate, commentController.list);
router.post('/:id/comments', authenticate, validate(commentSchema), commentController.create);
router.get('/:id/dependencies', authenticate, taskController.getDependencies);
router.patch('/:id/recurrence', authenticate, validate(recurrenceSchema), taskController.setRecurrence);
router.get('/:id', authenticate, taskController.get);
router.put('/:id', authenticate, validate(updateSchema), taskController.update);
router.delete('/:id', authenticate, requireAdmin, taskController.remove);
router.put('/:id/progress-sync', requireServiceToken, taskController.progressSync);

// ── Checklist routes ──────────────────────────────────────────────────────────
const checklistSchema = Joi.object({ title: Joi.string().min(1).max(200).required() });
const itemSchema = Joi.object({
  text:             Joi.string().min(1).max(500).required(),
  assignedPersonId: Joi.string().length(24).allow(null).optional(),
  parentItemId:     Joi.string().length(24).optional(),
});
const itemUpdateSchema = Joi.object({
  text:             Joi.string().min(1).max(500),
  completed:        Joi.boolean(),
  assignedPersonId: Joi.string().length(24).allow(null),
}).min(1);
const reorderSchema = Joi.object({ orderedIds: Joi.array().items(Joi.string().length(24)).required() });

router.post('/:id/checklists', authenticate, validate(checklistSchema), checklistController.createChecklist);
router.patch('/:id/checklists/:clId', authenticate, validate(checklistSchema), checklistController.renameChecklist);
router.delete('/:id/checklists/:clId', authenticate, checklistController.deleteChecklist);
router.post('/:id/checklists/:clId/items', authenticate, validate(itemSchema), checklistController.addItem);
router.patch('/:id/checklists/:clId/items/:itemId', authenticate, validate(itemUpdateSchema), checklistController.updateItem);
router.delete('/:id/checklists/:clId/items/:itemId', authenticate, checklistController.deleteItem);
router.put('/:id/checklists/:clId/reorder', authenticate, validate(reorderSchema), checklistController.reorderItems);
router.put('/:id/checklists/:clId/items/:itemId/reorder', authenticate, validate(reorderSchema), checklistController.reorderSubItems);

export default router;
