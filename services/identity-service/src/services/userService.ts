import * as userRepository from '../repositories/userRepository';

export const listUsers = () => userRepository.findAll();

export async function getUser(id: string) {
  const user = await userRepository.findById(id);
  if (!user) {
    const err = new Error('User not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }
  return user;
}

export async function updateUser(id: string, data: Record<string, unknown>) {
  const user = await userRepository.updateById(id, data);
  if (!user) {
    const err = new Error('User not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }
  return user;
}
