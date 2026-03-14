import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IApiKey extends Document {
  userId: Types.ObjectId;
  name: string;
  keyHash: string;
  prefix: string;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ApiKeySchema = new Schema<IApiKey>(
  {
    userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name:      { type: String, required: true, trim: true, maxlength: 100 },
    keyHash:   { type: String, required: true, unique: true },
    prefix:    { type: String, required: true },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<IApiKey>('ApiKey', ApiKeySchema);
