import mongoose, { Document, Schema } from 'mongoose';
import { createAuditPlugin } from '@task-tracker/utils';
import AuditLog from './AuditLog';

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

export const RECURRENCE_FREQUENCIES = ['daily', 'weekly', 'monthly', 'quarterly'] as const;

export type Category = typeof CATEGORIES[number];
export type Status = typeof STATUSES[number];
export type RecurrenceFrequency = typeof RECURRENCE_FREQUENCIES[number];

export interface IRecurrence {
  enabled: boolean;
  frequency: RecurrenceFrequency;
  interval: number;
  nextRunAt: Date;
  lastRunAt: Date | null;
  endDate: Date | null;
  maxOccurrences: number | null;
  occurrenceCount: number;
}

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
  blockedBy: mongoose.Types.ObjectId[];
  recurrence: IRecurrence | null;
  parentTaskId: mongoose.Types.ObjectId | null;
}

const RecurrenceSchema = new Schema<IRecurrence>(
  {
    enabled:         { type: Boolean, default: false },
    frequency:       { type: String, enum: RECURRENCE_FREQUENCIES },
    interval:        { type: Number, default: 1, min: 1 },
    nextRunAt:       { type: Date },
    lastRunAt:       { type: Date, default: null },
    endDate:         { type: Date, default: null },
    maxOccurrences:  { type: Number, default: null },
    occurrenceCount: { type: Number, default: 0 },
  },
  { _id: false }
);

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
    blockedBy:        { type: [Schema.Types.ObjectId], default: [] },
    recurrence:       { type: RecurrenceSchema, default: null },
    parentTaskId:     { type: Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

TaskSchema.index({ assignedTeamId: 1, status: 1 });
TaskSchema.index({ dueDate: 1, status: 1 });
TaskSchema.index({ nextUpdateDate: 1 });
TaskSchema.index({ blockedBy: 1 });
TaskSchema.index({ 'recurrence.enabled': 1, 'recurrence.nextRunAt': 1 });
TaskSchema.index({ parentTaskId: 1 });

TaskSchema.plugin(createAuditPlugin(AuditLog as any, 'task'));

export default mongoose.model<ITask>('Task', TaskSchema);
