import mongoose, { Document, Schema } from 'mongoose';
import { createAuditPlugin } from '@task-tracker/utils';
import AuditLog from './AuditLog';

export type AlertType = 'past_due' | 'update_overdue' | 'behind_schedule' | 'stalled';
export type AlertSeverity = 'low' | 'medium' | 'high';

export type ResolvedBy = 'user' | 'system' | null;

export interface IAlert extends Document {
  taskId: mongoose.Types.ObjectId;
  teamId: mongoose.Types.ObjectId;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  metadata: Record<string, unknown>;
  isActive: boolean;
  resolvedAt: Date | null;
  resolvedBy: ResolvedBy;
  createdAt: Date;
  updatedAt: Date;
}

const ALERT_TYPES: AlertType[] = ['past_due', 'update_overdue', 'behind_schedule', 'stalled'];
const SEVERITIES: AlertSeverity[] = ['low', 'medium', 'high'];

const AlertSchema = new Schema<IAlert>(
  {
    taskId:     { type: Schema.Types.ObjectId, required: true },
    teamId:     { type: Schema.Types.ObjectId, required: true },
    type:       { type: String, enum: ALERT_TYPES, required: true },
    severity:   { type: String, enum: SEVERITIES, required: true },
    message:    { type: String, required: true },
    metadata:   { type: Schema.Types.Mixed, default: {} },
    isActive:   { type: Boolean, default: true },
    resolvedAt: { type: Date, default: null },
    resolvedBy: { type: String, enum: ['user', 'system', null], default: null },
  },
  { timestamps: true }
);

AlertSchema.index({ taskId: 1, type: 1, isActive: 1 });
AlertSchema.index({ teamId: 1, isActive: 1 });

AlertSchema.plugin(createAuditPlugin(AuditLog as any, 'alert'));

export default mongoose.model<IAlert>('Alert', AlertSchema);
