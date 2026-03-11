import * as userRepository from '../repositories/userRepository';
import { logger } from '@task-tracker/utils';

export const listUsers = async () => {
  logger.debug('userService.listUsers');
  const users = await userRepository.findAll();
  logger.debug('userService.listUsers result', { count: users.length });
  return users;
};

export async function getUser(id: string) {
  logger.debug('userService.getUser', { id });
  const user = await userRepository.findById(id);
  if (!user) {
    logger.debug('userService.getUser not found', { id });
    const err = new Error('User not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }
  logger.debug('userService.getUser result', { user });
  return user;
}

export async function updateUser(id: string, data: Record<string, unknown>) {
  logger.debug('userService.updateUser', { id, data });
  const user = await userRepository.updateById(id, data);
  if (!user) {
    logger.debug('userService.updateUser not found', { id });
    const err = new Error('User not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }
  logger.debug('userService.updateUser result', { user });
  return user;
}
