const mongoose = require('mongoose');

const STATUSES = ['not_started', 'in_progress', 'blocked', 'completed', 'cancelled'];

const TaskUpdateSchema = new mongoose.Schema({
  taskId:        { type: mongoose.Schema.Types.ObjectId, required: true },
  teamId:        { type: mongoose.Schema.Types.ObjectId, required: true },
  authorId:      { type: mongoose.Schema.Types.ObjectId, required: true },
  completionPct: { type: Number, min: 0, max: 100, required: true },
  status:        { type: String, enum: STATUSES, required: true },
  comment:       { type: String, default: '' },
  nextUpdateDate: { type: Date, default: null },
  recordedAt:    { type: Date, default: Date.now },
}, { timestamps: true });

TaskUpdateSchema.index({ taskId: 1, recordedAt: -1 });
TaskUpdateSchema.index({ teamId: 1, recordedAt: -1 });

module.exports = mongoose.model('TaskUpdate', TaskUpdateSchema);
