const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: '' },
  memberIds:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  leadId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Team', TeamSchema);
