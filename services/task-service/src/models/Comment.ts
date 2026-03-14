import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  taskId: mongoose.Types.ObjectId;
  authorId: string;
  authorEmail: string;
  body: string;
}

const CommentSchema = new Schema<IComment>(
  {
    taskId:      { type: Schema.Types.ObjectId, required: true },
    authorId:    { type: String, required: true },
    authorEmail: { type: String, required: true },
    body:        { type: String, required: true, maxlength: 2000, trim: true },
  },
  { timestamps: true }
);

CommentSchema.index({ taskId: 1, createdAt: -1 });

export default mongoose.model<IComment>('Comment', CommentSchema);
