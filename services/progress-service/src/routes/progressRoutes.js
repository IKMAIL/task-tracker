const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/authenticate');
const progressController = require('../controllers/progressController');

const STATUSES = ['not_started', 'in_progress', 'blocked', 'completed', 'cancelled'];

const logSchema = Joi.object({
  taskId:        Joi.string().required(),
  teamId:        Joi.string().required(),
  completionPct: Joi.number().min(0).max(100).required(),
  status:        Joi.string().valid(...STATUSES).required(),
  comment:       Joi.string().max(2000).default(''),
  nextUpdateDate: Joi.date().optional().allow(null),
});

router.post('/',                      authenticate, validate(logSchema), progressController.log);
router.get('/task/:taskId',           authenticate, progressController.getHistory);
router.get('/latest/:taskId',         authenticate, progressController.getLatest);
router.get('/team/:teamId',           authenticate, progressController.getTeamUpdates);

module.exports = router;
