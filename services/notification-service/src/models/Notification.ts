import mongoose, { Document, Schema } from 'mongoose';

export type NotificationSourceType = 'alert' | 'task' | 'progress' | 'mention' | 'escalation' | 'system';

export type NotificationType =
  | 'past_due'
  | 'update_overdue'
  | 'behind_schedule'
  | 'stalled'
  | 'task_assigned'
  | 'task_status_changed'
  | 'task_reassigned'
  | 'comment_added'
  | 'mentioned'
  | 'progress_updated'
  | 'escalation_triggered'
  | 'custom_rule_triggered';

export type NotificationSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface INotification extends Document {
  userId: string;
  actorId?: string;
  sourceType: NotificationSourceType;
  sourceId: string;
  type: NotificationType;
  title: string;
  body: string;
  severity: NotificationSeverity;
  isRead: boolean;
  readAt?: Date;
  snoozeUntil?: Date;
  archivedAt?: Date;
  idempotencyKey: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const SOURCE_TYPES: NotificationSourceType[] = ['alert', 'task', 'progress', 'mention', 'escalation', 'system'];
const TYPES: NotificationType[] = [
  'past_due', 'update_overdue', 'behind_schedule', 'stalled',
  'task_assigned', 'task_status_changed', 'task_reassigned',
  'comment_added', 'mentioned', 'progress_updated',
  'escalation_triggered', 'custom_rule_triggered',
];
const SEVERITIES: NotificationSeverity[] = ['low', 'medium', 'high', 'critical'];

const NotificationSchema = new Schema<INotification>(
  {
    userId:           { type: String, required: true },
    actorId:          { type: String },
    sourceType:       { type: String, enum: SOURCE_TYPES, required: true },
    sourceId:         { type: String, required: true },
    type:             { type: String, enum: TYPES, required: true },
    title:            { type: String, required: true },
    body:             { type: String, required: true },
    severity:         { type: String, enum: SEVERITIES, default: 'low' },
    isRead:           { type: Boolean, default: false },
    readAt:           { type: Date },
    snoozeUntil:      { type: Date },
    archivedAt:       { type: Date },
    idempotencyKey:   { type: String, required: true },
    metadata:         { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, archivedAt: 1 });
NotificationSchema.index({ userId: 1, snoozeUntil: 1 });
NotificationSchema.index({ userId: 1, type: 1 });
NotificationSchema.index({ idempotencyKey: 1 }, { unique: true });
// TTL: auto-expire after 90 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
