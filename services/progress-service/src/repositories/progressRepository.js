const TaskUpdate = require('../models/TaskUpdate');

exports.create = (data) => TaskUpdate.create(data);

exports.findByTask = (taskId) =>
  TaskUpdate.find({ taskId }).sort({ recordedAt: -1 }).lean();

exports.findLatestByTask = (taskId) =>
  TaskUpdate.findOne({ taskId }).sort({ recordedAt: -1 }).lean();

exports.findByTeam = (teamId) =>
  TaskUpdate.find({ teamId }).sort({ recordedAt: -1 }).limit(100).lean();
