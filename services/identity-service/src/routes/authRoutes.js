const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validate = require('../middleware/validate');
const authController = require('../controllers/authController');

const registerSchema = Joi.object({
  name:     Joi.string().min(2).max(100).required(),
  email:    Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role:     Joi.string().valid('admin', 'member').default('member'),
});

const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});

const microsoftLoginSchema = Joi.object({ idToken: Joi.string().required() });

const microsoftMergeSchema = Joi.object({
  idToken:  Joi.string().required(),
  password: Joi.string().required(),
});

router.post('/register',         validate(registerSchema),       authController.register);
router.post('/login',            validate(loginSchema),           authController.login);
router.post('/microsoft',        validate(microsoftLoginSchema),  authController.microsoftLogin);
router.post('/microsoft/merge',  validate(microsoftMergeSchema),  authController.microsoftMerge);

module.exports = router;
