import Comment from '../models/Comment';
import { logger } from '@task-tracker/utils';

export const findByTask = async (taskId: string) => {
  logger.debug('commentRepository.findByTask', { taskId });
  const comments = await Comment.find({ taskId }).sort({ createdAt: -1 }).lean();
  logger.debug('commentRepository.findByTask result', { taskId, count: comments.length });
  return comments;
};

export const create = async (data: {
  taskId: string;
  authorId: string;
  authorEmail: string;
  body: string;
}) => {
  logger.debug('commentRepository.create', { taskId: data.taskId });
  const doc = new Comment(data);
  const comment = await doc.save();
  logger.debug('commentRepository.create result', { commentId: String(comment._id) });
  return comment;
};
