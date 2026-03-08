const taskService = require('../services/taskService');

exports.create = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.body, req.user.sub);
    res.status(201).json({ success: true, data: task });
  } catch (err) { next(err); }
};

exports.list = async (req, res, next) => {
  try {
    const { teamId, status, category, page, limit } = req.query;
    const result = await taskService.listTasks({ teamId, status, category }, { page, limit });
    res.json({ success: true, data: result.tasks, meta: result.meta });
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const task = await taskService.getTask(req.params.id);
    res.json({ success: true, data: task });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body);
    res.json({ success: true, data: task });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await taskService.cancelTask(req.params.id);
    res.json({ success: true, data: { message: 'Task cancelled' } });
  } catch (err) { next(err); }
};

exports.getByTeam = async (req, res, next) => {
  try {
    const tasks = await taskService.getByTeam(req.params.teamId);
    res.json({ success: true, data: tasks });
  } catch (err) { next(err); }
};

exports.summary = async (req, res, next) => {
  try {
    const data = await taskService.getSummary();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.progressSync = async (req, res, next) => {
  try {
    const task = await taskService.syncProgress(req.params.id, req.body);
    res.json({ success: true, data: task });
  } catch (err) { next(err); }
};
