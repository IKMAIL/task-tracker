import mongoose, { Document, Schema } from 'mongoose';

export type DeliveryChannel = 'inApp' | 'email' | 'push' | 'slack';
export type DeliveryStatus = 'pending' | 'sent' | 'failed' | 'skipped';

export interface IDeliveryLog extends Document {
  notificationId: mongoose.Types.ObjectId;
  userId: string;
  channel: DeliveryChannel;
  status: DeliveryStatus;
  externalId?: string;
  retryCount: number;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryLogSchema = new Schema<IDeliveryLog>(
  {
    notificationId: { type: Schema.Types.ObjectId, required: true },
    userId:         { type: String, required: true },
    channel:        { type: String, enum: ['inApp', 'email', 'push', 'slack'], required: true },
    status:         { type: String, enum: ['pending', 'sent', 'failed', 'skipped'], default: 'pending' },
    externalId:     { type: String },
    retryCount:     { type: Number, default: 0 },
    errorMessage:   { type: String },
  },
  { timestamps: true }
);

DeliveryLogSchema.index({ notificationId: 1, channel: 1 });
DeliveryLogSchema.index({ userId: 1, createdAt: -1 });
// TTL: 30 days
DeliveryLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export default mongoose.model<IDeliveryLog>('DeliveryLog', DeliveryLogSchema);
