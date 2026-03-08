const progressService = require('../services/progressService');

exports.log = async (req, res, next) => {
  try {
    const update = await progressService.logUpdate(req.body, req.user.sub);
    res.status(201).json({ success: true, data: update });
  } catch (err) { next(err); }
};

exports.getHistory = async (req, res, next) => {
  try {
    const updates = await progressService.getHistory(req.params.taskId);
    res.json({ success: true, data: updates });
  } catch (err) { next(err); }
};

exports.getLatest = async (req, res, next) => {
  try {
    const update = await progressService.getLatest(req.params.taskId);
    res.json({ success: true, data: update });
  } catch (err) { next(err); }
};

exports.getTeamUpdates = async (req, res, next) => {
  try {
    const updates = await progressService.getTeamUpdates(req.params.teamId);
    res.json({ success: true, data: updates });
  } catch (err) { next(err); }
};
