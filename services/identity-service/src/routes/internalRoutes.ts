import { Router } from 'express';
import Joi from 'joi';
import validate from '../middleware/validate';
import { requireServiceToken } from '../middleware/authenticate';
import * as apiKeyController from '../controllers/apiKeyController';

const router: Router = Router();

const validateSchema = Joi.object({
  key: Joi.string().pattern(/^ttk_[0-9a-f]{64}$/).required(),
});

router.post('/api-keys/validate', requireServiceToken, validate(validateSchema), apiKeyController.validate);

export default router;
