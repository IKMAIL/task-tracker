const authService = require('../services/authService');

exports.register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.microsoftLogin = async (req, res, next) => {
  try {
    const result = await authService.microsoftLogin(req.body.idToken);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.microsoftMerge = async (req, res, next) => {
  try {
    const result = await authService.mergeWithMicrosoft(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
