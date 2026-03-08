const User = require('../models/User');

// All MongoDB access for users is encapsulated here.
exports.findByEmail = (email) => User.findOne({ email }).lean();
exports.findById    = (id)    => User.findById(id).lean();
exports.findAll     = ()      => User.find().select('-passwordHash').lean();
exports.create      = (data)  => User.create(data);
exports.findByMicrosoftId = (microsoftId) => User.findOne({ microsoftId }).lean();
exports.updateById  = (id, data) =>
  User.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })
    .select('-passwordHash').lean();
