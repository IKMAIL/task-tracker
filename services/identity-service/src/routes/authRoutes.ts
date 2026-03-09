import { Router } from 'express';
import Joi from 'joi';
import validate from '../middleware/validate';
import * as authController from '../controllers/authController';

const router: Router = Router();

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'member').default('member'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const microsoftLoginSchema = Joi.object({
  idToken: Joi.string().required(),
});

const microsoftMergeSchema = Joi.object({
  idToken: Joi.string().required(),
  password: Joi.string().required(),
});

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/microsoft', validate(microsoftLoginSchema), authController.microsoftLogin);
router.post('/microsoft/merge', validate(microsoftMergeSchema), authController.microsoftMerge);

export default router;
