import mongoose, { Document, Schema } from 'mongoose';

export interface IChannelPreference {
  enabled: boolean;
  minSeverity: 'low' | 'medium' | 'high' | 'critical';
}

export interface IQuietHours {
  enabled: boolean;
  timezone: string;
  startHour: number;
  endHour: number;
}

export interface INotificationPreference extends Document {
  userId: string;
  channels: {
    inApp: IChannelPreference;
    email: IChannelPreference;
    push: IChannelPreference;
    slack: IChannelPreference;
  };
  mutedTypes: string[];
  quietHours?: IQuietHours;
  createdAt: Date;
  updatedAt: Date;
}

const channelPrefSchema = new Schema<IChannelPreference>(
  {
    enabled:     { type: Boolean, default: false },
    minSeverity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
  },
  { _id: false }
);

const NotificationPreferenceSchema = new Schema<INotificationPreference>(
  {
    userId:     { type: String, required: true, unique: true },
    channels: {
      inApp: { type: channelPrefSchema, default: { enabled: true, minSeverity: 'low' } },
      email: { type: channelPrefSchema, default: { enabled: false, minSeverity: 'low' } },
      push:  { type: channelPrefSchema, default: { enabled: false, minSeverity: 'medium' } },
      slack: { type: channelPrefSchema, default: { enabled: false, minSeverity: 'high' } },
    },
    mutedTypes: { type: [String], default: [] },
    quietHours: {
      type: new Schema<IQuietHours>(
        {
          enabled:   { type: Boolean, default: false },
          timezone:  { type: String, default: 'UTC' },
          startHour: { type: Number, min: 0, max: 23, default: 22 },
          endHour:   { type: Number, min: 0, max: 23, default: 8 },
        },
        { _id: false }
      ),
      default: undefined,
    },
  },
  { timestamps: true }
);

NotificationPreferenceSchema.index({ userId: 1 });

export default mongoose.model<INotificationPreference>('NotificationPreference', NotificationPreferenceSchema);
