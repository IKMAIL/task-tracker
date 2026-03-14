import { Router } from 'express';
import Joi from 'joi';
import validate from '../middleware/validate';
import * as authController from '../controllers/authController';

const router: Router = Router();

const microsoftLoginSchema = Joi.object({
  idToken: Joi.string().required(),
});

router.post('/microsoft', validate(microsoftLoginSchema), authController.microsoftLogin);

export default router;
