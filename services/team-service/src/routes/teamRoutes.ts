import { Router } from 'express';
import Joi from 'joi';
import validate from '../middleware/validate';
import { authenticate, requireAdmin } from '../middleware/authenticate';
import * as teamController from '../controllers/teamController';

const router: Router = Router();

const createTeamSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).default(''),
});

const updateTeamSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  description: Joi.string().max(500),
}).min(1);

const addMemberSchema = Joi.object({
  memberId: Joi.string().required(),
});

router.get('/', authenticate, teamController.list);
router.get('/:id', authenticate, teamController.get);
router.post('/', authenticate, validate(createTeamSchema), teamController.create);
router.put('/:id', authenticate, validate(updateTeamSchema), teamController.update);
router.delete('/:id', authenticate, teamController.remove);
router.post('/:id/members', authenticate, validate(addMemberSchema), teamController.addMember);
router.delete('/:id/members/:memberId', authenticate, teamController.removeMember);

export default router;
