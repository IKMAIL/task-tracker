const mongoose = require('mongoose');

const CATEGORIES = [
  'Automation Testing Coverage',
  'DR Dry Run',
  'Active-Active Setup',
  'LEAP Framework Adherence',
  'Claude Code Adoption %',
  'Open Operational Items',
  'Security Risk Items',
];

const STATUSES = ['not_started', 'in_progress', 'blocked', 'completed', 'cancelled'];

const TaskSchema = new mongoose.Schema({
  title:            { type: String, required: true, trim: true },
  description:      { type: String, default: '' },
  category:         { type: String, enum: CATEGORIES, required: true },
  assignedTeamId:   { type: mongoose.Schema.Types.ObjectId, required: true },
  assignedPersonId: { type: mongoose.Schema.Types.ObjectId, default: null },
  status:           { type: String, enum: STATUSES, default: 'not_started' },
  completionPct:    { type: Number, min: 0, max: 100, default: 0 },
  plannedStartDate: { type: Date, required: true },
  dueDate:          { type: Date, required: true },
  nextUpdateDate:   { type: Date, default: null },
  lastUpdatedAt:    { type: Date, default: null },
  createdBy:        { type: mongoose.Schema.Types.ObjectId, required: true },
}, { timestamps: true });

TaskSchema.index({ assignedTeamId: 1, status: 1 });
TaskSchema.index({ dueDate: 1, status: 1 });
TaskSchema.index({ nextUpdateDate: 1 });

module.exports = mongoose.model('Task', TaskSchema);
