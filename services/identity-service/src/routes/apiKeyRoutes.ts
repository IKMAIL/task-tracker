import { Router } from 'express';
import Joi from 'joi';
import validate from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import * as apiKeyController from '../controllers/apiKeyController';

const router: Router = Router();

const createSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  expiresAt: Joi.string().isoDate().allow(null).optional(),
});

router.post('/',      authenticate, validate(createSchema), apiKeyController.create);
router.get('/',       authenticate,                         apiKeyController.list);
router.delete('/:id', authenticate,                         apiKeyController.revoke);

export default router;
