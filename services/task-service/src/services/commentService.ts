import * as commentRepository from '../repositories/commentRepository';
import * as taskRepository from '../repositories/taskRepository';
import { logger } from '@task-tracker/utils';

export const getComments = async (taskId: string) => {
  logger.debug('commentService.getComments', { taskId });
  const task = await taskRepository.findById(taskId);
  if (!task) throw Object.assign(new Error('Task not found'), { status: 404 });
  const comments = await commentRepository.findByTask(taskId);
  logger.debug('commentService.getComments result', { taskId, count: comments.length });
  return comments;
};

export const addComment = async (
  taskId: string,
  authorId: string,
  authorEmail: string,
  body: string
) => {
  logger.debug('commentService.addComment', { taskId, authorId });
  const task = await taskRepository.findById(taskId);
  if (!task) throw Object.assign(new Error('Task not found'), { status: 404 });
  const comment = await commentRepository.create({ taskId, authorId, authorEmail, body });
  logger.info('comment added', { taskId, commentId: String(comment._id), authorId });
  return comment;
};
