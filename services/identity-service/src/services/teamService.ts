import * as teamRepository from '../repositories/teamRepository';
import * as userRepository from '../repositories/userRepository';
import { logger } from '@task-tracker/utils';

export const listTeams = async () => {
  logger.debug('teamService.listTeams');
  const teams = await teamRepository.findAll();
  logger.debug('teamService.listTeams result', { count: teams.length });
  return teams;
};

export async function getTeam(id: string) {
  logger.debug('teamService.getTeam', { id });
  const team = await teamRepository.findById(id);
  if (!team) {
    logger.debug('teamService.getTeam not found', { id });
    const err = new Error('Team not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }
  logger.debug('teamService.getTeam result', { team });
  return team;
}

export async function createTeam(data: Record<string, unknown>) {
  logger.debug('teamService.createTeam', { data });
  const existing = await teamRepository.findByName(data.name as string);
  if (existing) {
    logger.debug('teamService.createTeam name conflict', { name: data.name });
    const err = new Error('Team name already exists') as Error & { status: number };
    err.status = 409;
    throw err;
  }
  const team = await teamRepository.create(data);
  logger.debug('teamService.createTeam result', { team });
  return team;
}

export async function addMember(teamId: string, userId: string) {
  logger.debug('teamService.addMember', { teamId, userId });
  const [team, user] = await Promise.all([
    teamRepository.findById(teamId),
    userRepository.findById(userId),
  ]);

  if (!team) {
    logger.debug('teamService.addMember team not found', { teamId });
    const e = new Error('Team not found') as Error & { status: number };
    e.status = 404;
    throw e;
  }
  if (!user) {
    logger.debug('teamService.addMember user not found', { userId });
    const e = new Error('User not found') as Error & { status: number };
    e.status = 404;
    throw e;
  }

  logger.debug('teamService.addMember assigning user to team', { teamId, userId });
  await userRepository.updateById(userId, { teamId });
  const updated = await teamRepository.addMember(teamId, userId);
  logger.debug('teamService.addMember result', { team: updated });
  return updated;
}

export async function removeMember(teamId: string, userId: string) {
  logger.debug('teamService.removeMember', { teamId, userId });
  const team = await teamRepository.findById(teamId);
  if (!team) {
    logger.debug('teamService.removeMember team not found', { teamId });
    const e = new Error('Team not found') as Error & { status: number };
    e.status = 404;
    throw e;
  }

  logger.debug('teamService.removeMember removing user from team', { teamId, userId });
  await userRepository.updateById(userId, { teamId: null });
  const updated = await teamRepository.removeMember(teamId, userId);
  logger.debug('teamService.removeMember result', { team: updated });
  return updated;
}
