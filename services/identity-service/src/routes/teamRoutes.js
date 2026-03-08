const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validate = require('../middleware/validate');
const { authenticate, requireAdmin } = require('../middleware/authenticate');
const teamController = require('../controllers/teamController');

const createTeamSchema = Joi.object({
  name:        Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).default(''),
});

const addMemberSchema = Joi.object({
  userId: Joi.string().required(),
});

router.get('/',                           authenticate, teamController.list);
router.get('/:id',                        authenticate, teamController.get);
router.post('/',                          authenticate, requireAdmin, validate(createTeamSchema), teamController.create);
router.post('/:id/members',              authenticate, requireAdmin, validate(addMemberSchema),  teamController.addMember);
router.delete('/:id/members/:userId',    authenticate, requireAdmin, teamController.removeMember);

module.exports = router;
