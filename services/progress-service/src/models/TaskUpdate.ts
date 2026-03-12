import mongoose, { Document, Schema } from 'mongoose';
import { createAuditPlugin } from '@task-tracker/utils';
import AuditLog from './AuditLog';

export const STATUSES = ['not_started', 'in_progress', 'blocked', 'completed', 'cancelled'] as const;
export type Status = typeof STATUSES[number];

export interface ITaskUpdate extends Document {
  taskId: mongoose.Types.ObjectId;
  teamId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  completionPct: number;
  status: Status;
  comment: string;
  nextUpdateDate: Date | null;
  recordedAt: Date;
}

const TaskUpdateSchema = new Schema<ITaskUpdate>(
  {
    taskId:        { type: Schema.Types.ObjectId, required: true },
    teamId:        { type: Schema.Types.ObjectId, required: true },
    authorId:      { type: Schema.Types.ObjectId, required: true },
    completionPct: { type: Number, min: 0, max: 100, required: true },
    status:        { type: String, enum: STATUSES, required: true },
    comment:       { type: String, default: '' },
    nextUpdateDate: { type: Date, default: null },
    recordedAt:    { type: Date, default: Date.now },
  },
  { timestamps: true }
);

TaskUpdateSchema.index({ taskId: 1, recordedAt: -1 });
TaskUpdateSchema.index({ teamId: 1, recordedAt: -1 });

TaskUpdateSchema.plugin(createAuditPlugin(AuditLog as any, 'progress'));

export default mongoose.model<ITaskUpdate>('TaskUpdate', TaskUpdateSchema);
