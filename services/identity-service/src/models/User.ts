import mongoose, { Document, Schema, Types } from 'mongoose';
import { createAuditPlugin } from '@task-tracker/utils';
import AuditLog from './AuditLog';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  authProvider: 'local' | 'microsoft';
  microsoftId?: string | null;
  role: 'admin' | 'member';
  isActive: boolean;
  teamId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: false },
    authProvider: { type: String, enum: ['local', 'microsoft'], default: 'local' },
    microsoftId:  { type: String, unique: true, sparse: true, default: null },
    role:         { type: String, enum: ['admin', 'member'], default: 'member' },
    isActive:     { type: Boolean, default: true },
    teamId:       { type: Schema.Types.ObjectId, ref: 'Team', default: null },
  },
  { timestamps: true }
);

UserSchema.plugin(createAuditPlugin(AuditLog as any, 'user'));

export default mongoose.model<IUser>('User', UserSchema);
