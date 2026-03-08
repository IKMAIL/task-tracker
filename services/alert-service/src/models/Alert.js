const mongoose = require('mongoose');

const ALERT_TYPES = ['past_due', 'update_overdue', 'behind_schedule', 'stalled'];
const SEVERITIES  = ['low', 'medium', 'high'];

const AlertSchema = new mongoose.Schema({
  taskId:     { type: mongoose.Schema.Types.ObjectId, required: true },
  teamId:     { type: mongoose.Schema.Types.ObjectId, required: true },
  type:       { type: String, enum: ALERT_TYPES, required: true },
  severity:   { type: String, enum: SEVERITIES, required: true },
  message:    { type: String, required: true },
  metadata:   { type: mongoose.Schema.Types.Mixed, default: {} },
  isActive:   { type: Boolean, default: true },
  resolvedAt: { type: Date, default: null },
}, { timestamps: true });

AlertSchema.index({ taskId: 1, type: 1, isActive: 1 });
AlertSchema.index({ teamId: 1, isActive: 1 });

module.exports = mongoose.model('Alert', AlertSchema);
