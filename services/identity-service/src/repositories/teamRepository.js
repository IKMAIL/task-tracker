const Team = require('../models/Team');

exports.findAll    = ()     => Team.find().lean();
exports.findById   = (id)   => Team.findById(id).lean();
exports.findByName = (name) => Team.findOne({ name }).lean();
exports.create     = (data) => Team.create(data);
exports.updateById = (id, data) =>
  Team.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).lean();
exports.addMember = (teamId, userId) =>
  Team.findByIdAndUpdate(teamId, { $addToSet: { memberIds: userId } }, { new: true }).lean();
exports.removeMember = (teamId, userId) =>
  Team.findByIdAndUpdate(teamId, { $pull: { memberIds: userId } }, { new: true }).lean();
