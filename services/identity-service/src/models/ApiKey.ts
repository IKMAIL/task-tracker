import mongoose, { Document, Schema, Types } from 'mongoose';

export const API_KEY_PERMISSIONS = [
  'tasks:read',
  'tasks:write',
  'progress:read',
  'progress:write',
  'alerts:read',
  'alerts:write',
  'teams:read',
  'teams:write',
] as const;

export type ApiKeyPermission = typeof API_KEY_PERMISSIONS[number];

export interface IApiKey extends Document {
  userId: Types.ObjectId;
  name: string;
  keyHash: string;
  prefix: string;
  permissions: ApiKeyPermission[];
  isActive: boolean;
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ApiKeySchema = new Schema<IApiKey>(
  {
    userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name:        { type: String, required: true, trim: true, maxlength: 100 },
    keyHash:     { type: String, required: true, unique: true },
    prefix:      { type: String, required: true },
    permissions: { type: [String], enum: API_KEY_PERMISSIONS, required: true },
    isActive:    { type: Boolean, default: true, index: true },
    expiresAt:   { type: Date, default: null },
    lastUsedAt:  { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<IApiKey>('ApiKey', ApiKeySchema);
