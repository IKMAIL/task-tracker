import * as teamRepository from '../repositories/teamRepository';
import * as userRepository from '../repositories/userRepository';

export const listTeams = () => teamRepository.findAll();

export async function getTeam(id: string) {
  const team = await teamRepository.findById(id);
  if (!team) {
    const err = new Error('Team not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }
  return team;
}

export async function createTeam(data: Record<string, unknown>) {
  const existing = await teamRepository.findByName(data.name as string);
  if (existing) {
    const err = new Error('Team name already exists') as Error & { status: number };
    err.status = 409;
    throw err;
  }
  return teamRepository.create(data);
}

export async function addMember(teamId: string, userId: string) {
  const [team, user] = await Promise.all([
    teamRepository.findById(teamId),
    userRepository.findById(userId),
  ]);

  if (!team) {
    const e = new Error('Team not found') as Error & { status: number };
    e.status = 404;
    throw e;
  }
  if (!user) {
    const e = new Error('User not found') as Error & { status: number };
    e.status = 404;
    throw e;
  }

  await userRepository.updateById(userId, { teamId });
  return teamRepository.addMember(teamId, userId);
}

export async function removeMember(teamId: string, userId: string) {
  const team = await teamRepository.findById(teamId);
  if (!team) {
    const e = new Error('Team not found') as Error & { status: number };
    e.status = 404;
    throw e;
  }

  await userRepository.updateById(userId, { teamId: null });
  return teamRepository.removeMember(teamId, userId);
}
