import { Router } from 'express';
import Joi from 'joi';
import validate from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import * as memberController from '../controllers/memberController';

const router: Router = Router();

const createMemberSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  loginId: Joi.string().min(1).max(100).required(),
  position: Joi.string().max(100).allow('').default(''),
  birthday: Joi.date().iso().allow(null).default(null),
  joiningDate: Joi.date().iso().allow(null).default(null),
});

const updateMemberSchema = Joi.object({
  name: Joi.string().min(1).max(100),
  loginId: Joi.string().min(1).max(100),
  position: Joi.string().max(100).allow(''),
  birthday: Joi.date().iso().allow(null),
  joiningDate: Joi.date().iso().allow(null),
}).min(1);

router.get('/', authenticate, memberController.list);
router.get('/:id', authenticate, memberController.get);
router.post('/', authenticate, validate(createMemberSchema), memberController.create);
router.put('/:id', authenticate, validate(updateMemberSchema), memberController.update);
router.delete('/:id', authenticate, memberController.remove);

export default router;
