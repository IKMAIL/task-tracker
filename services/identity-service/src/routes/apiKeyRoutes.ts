import { Router } from 'express';
import Joi from 'joi';
import validate from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { API_KEY_PERMISSIONS } from '../models/ApiKey';
import * as apiKeyController from '../controllers/apiKeyController';

const router: Router = Router();

const createSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  permissions: Joi.array()
    .items(Joi.string().valid(...API_KEY_PERMISSIONS))
    .min(1)
    .required()
    .messages({ 'array.min': 'At least one permission is required' }),
  expiresAt: Joi.string().isoDate().allow(null).optional(),
});

router.post('/',      authenticate, validate(createSchema), apiKeyController.create);
router.get('/',       authenticate,                         apiKeyController.list);
router.delete('/:id', authenticate,                         apiKeyController.revoke);

export default router;
