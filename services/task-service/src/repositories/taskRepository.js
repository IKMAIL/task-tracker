const Task = require('../models/Task');

exports.create = (data) => Task.create(data);

exports.findById = (id) => Task.findById(id).lean();

exports.findPaginated = async (query, { page = 1, limit = 20 } = {}) => {
  const skip = (Number(page) - 1) * Number(limit);
  const [tasks, total] = await Promise.all([
    Task.find(query).sort({ dueDate: 1 }).skip(skip).limit(Number(limit)).lean(),
    Task.countDocuments(query),
  ]);
  return {
    tasks,
    meta: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
  };
};

exports.findByTeam = (teamId) =>
  Task.find({ assignedTeamId: teamId }).sort({ dueDate: 1 }).lean();

exports.updateById = (id, data) =>
  Task.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).lean();

exports.summary = () =>
  Task.aggregate([
    { $group: { _id: { status: '$status', category: '$category' }, count: { $sum: 1 } } },
  ]);
