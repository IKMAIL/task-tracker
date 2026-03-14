import mongoose, { Schema } from 'mongoose';
import { IAuditLog } from '@task-tracker/utils';

const AuditLogSchema = new Schema<IAuditLog>(
  {
    resourceType: { type: String, required: true },
    resourceId:   { type: String, required: true },
    action:       { type: String, enum: ['create', 'update', 'delete'], required: true },
    userId:       { type: String, default: null },
    userEmail:    { type: String, default: null },
    changes: {
      before: { type: Schema.Types.Mixed, default: null },
      after:  { type: Schema.Types.Mixed, default: null },
    },
    timestamp: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

AuditLogSchema.index({ resourceType: 1, resourceId: 1, timestamp: -1 });

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
