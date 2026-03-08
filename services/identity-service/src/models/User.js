const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash:  { type: String, required: false },
  authProvider:  { type: String, enum: ['local', 'microsoft'], default: 'local' },
  microsoftId:   { type: String, unique: true, sparse: true, default: null },
  role:          { type: String, enum: ['admin', 'member'], default: 'member' },
  teamId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
