import mongoose, { Document, Schema, Types } from 'mongoose';
import { createAuditPlugin } from '@task-tracker/utils';
import AuditLog from './AuditLog';

export interface ITeam extends Document {
  name: string;
  description: string;
  memberIds: Types.ObjectId[];
  leadId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>(
  {
    name:        { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    memberIds:   [{ type: Schema.Types.ObjectId, ref: 'Member' }],
    leadId:      { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

TeamSchema.plugin(createAuditPlugin(AuditLog as any, 'team'));

export default mongoose.model<ITeam>('Team', TeamSchema);
