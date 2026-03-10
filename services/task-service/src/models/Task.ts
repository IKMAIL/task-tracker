import mongoose, { Document, Schema } from 'mongoose';

export const CATEGORIES = [
  'Automation Testing Coverage',
  'DR Dry Run',
  'Active-Active Setup',
  'LEAP Framework Adherence',
  'Claude Code Adoption %',
  'Open Operational Items',
  'Security Risk Items',
] as const;

export const STATUSES = ['not_started', 'in_progress', 'blocked', 'completed', 'cancelled'] as const;

export type Category = typeof CATEGORIES[number];
export type Status = typeof STATUSES[number];

export interface ITask extends Document {
  title: string;
  description: string;
  category: Category;
  assignedTeamId: mongoose.Types.ObjectId;
  assignedPersonId: mongoose.Types.ObjectId | null;
  status: Status;
  completionPct: number;
  plannedStartDate: Date;
  dueDate: Date;
  nextUpdateDate: Date | null;
  lastUpdatedAt: Date | null;
  createdBy: mongoose.Types.ObjectId;
}

const TaskSchema = new Schema<ITask>(
  {
    title:            { type: String, required: true, trim: true },
    description:      { type: String, default: '' },
    category:         { type: String, enum: CATEGORIES, required: true },
    assignedTeamId:   { type: Schema.Types.ObjectId, required: true },
    assignedPersonId: { type: Schema.Types.ObjectId, default: null },
    status:           { type: String, enum: STATUSES, default: 'not_started' },
    completionPct:    { type: Number, min: 0, max: 100, default: 0 },
    plannedStartDate: { type: Date, required: true },
    dueDate:          { type: Date, required: true },
    nextUpdateDate:   { type: Date, default: null },
    lastUpdatedAt:    { type: Date, default: null },
    createdBy:        { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

TaskSchema.index({ assignedTeamId: 1, status: 1 });
TaskSchema.index({ dueDate: 1, status: 1 });
TaskSchema.index({ nextUpdateDate: 1 });

export default mongoose.model<ITask>('Task', TaskSchema);
