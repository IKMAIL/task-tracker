import mongoose, { Document, Schema } from 'mongoose';
import { createAuditPlugin } from '@task-tracker/utils';
import AuditLog from './AuditLog';

export interface IMember extends Document {
  name: string;
  loginId: string;
  position: string;
  birthday?: Date | null;
  joiningDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<IMember>(
  {
    name:        { type: String, required: true, trim: true },
    loginId:     { type: String, required: true, unique: true, trim: true },
    position:    { type: String, default: '' },
    birthday:    { type: Date, default: null },
    joiningDate: { type: Date, default: null },
  },
  { timestamps: true }
);

MemberSchema.plugin(createAuditPlugin(AuditLog as any, 'member'));

export default mongoose.model<IMember>('Member', MemberSchema);
