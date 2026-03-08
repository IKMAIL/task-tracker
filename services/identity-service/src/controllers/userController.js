const userService = require('../services/userService');

exports.list = async (req, res, next) => {
  try {
    const users = await userService.listUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const user = await userService.getUser(req.params.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    // Users can only update themselves; admins can update anyone
    if (req.user.role !== 'admin' && req.user.sub !== req.params.id) {
      return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
    }
    const user = await userService.updateUser(req.params.id, req.body);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
