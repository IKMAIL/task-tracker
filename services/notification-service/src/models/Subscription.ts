import mongoose, { Document, Schema } from 'mongoose';

export type WatchLevel = 'all' | 'status_only' | 'mentions_only';

export interface ISubscription extends Document {
  userId: string;
  taskId: string;
  watchLevel: WatchLevel;
  autoUnsubscribeOnComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId:                    { type: String, required: true },
    taskId:                    { type: String, required: true },
    watchLevel:                { type: String, enum: ['all', 'status_only', 'mentions_only'], default: 'all' },
    autoUnsubscribeOnComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

SubscriptionSchema.index({ userId: 1, taskId: 1 }, { unique: true });
SubscriptionSchema.index({ taskId: 1 });

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
