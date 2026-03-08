const Alert = require('../models/Alert');

exports.findActive = (query = {}) =>
  Alert.find({ ...query, isActive: true }).sort({ createdAt: -1 }).lean();

exports.findActiveByTaskAndType = (taskId, type) =>
  Alert.findOne({ taskId, type, isActive: true }).lean();

exports.findById = (id) => Alert.findById(id).lean();

exports.create = (data) => Alert.create(data);

exports.updateById = (id, data) =>
  Alert.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();

exports.resolveByTaskAndType = (taskId, type) =>
  Alert.updateOne(
    { taskId, type, isActive: true },
    { $set: { isActive: false, resolvedAt: new Date() } }
  );

exports.resolveById = (id) =>
  Alert.findByIdAndUpdate(id, { $set: { isActive: false, resolvedAt: new Date() } }, { new: true }).lean();
