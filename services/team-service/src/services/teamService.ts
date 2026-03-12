import * as teamRepository from '../repositories/teamRepository';
import * as memberRepository from '../repositories/memberRepository';
import { logger, AuditUser } from '@task-tracker/utils';

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
    const err = new Error('Team not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }
  return team;
}

export async function createTeam(data: Record<string, unknown>) {
  logger.debug('teamService.createTeam', { data });
  const existing = await teamRepository.findByName(data.name as string);
  if (existing) {
    const err = new Error('Team name already exists') as Error & { status: number };
    err.status = 409;
    throw err;
  }
  const team = await teamRepository.create(data);
  logger.info('teamService.createTeam success', { teamId: String(team._id) });
  return team;
}

export async function updateTeam(id: string, data: Record<string, unknown>, auditUser?: AuditUser) {
  logger.debug('teamService.updateTeam', { id, data });
  const team = await teamRepository.findById(id);
  if (!team) {
    const err = new Error('Team not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }
  if (data.name && data.name !== team.name) {
    const existing = await teamRepository.findByName(data.name as string);
    if (existing) {
      const err = new Error('Team name already exists') as Error & { status: number };
      err.status = 409;
      throw err;
    }
  }
  const updated = await teamRepository.updateById(id, data, auditUser);
  logger.info('teamService.updateTeam success', { id });
  return updated;
}

export async function deleteTeam(id: string, auditUser?: AuditUser) {
  logger.debug('teamService.deleteTeam', { id });
  const team = await teamRepository.findById(id);
  if (!team) {
    const err = new Error('Team not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }
  await teamRepository.deleteById(id, auditUser);
  logger.info('teamService.deleteTeam success', { id });
}

export async function addMember(teamId: string, memberId: string) {
  logger.debug('teamService.addMember', { teamId, memberId });
  const team = await teamRepository.findById(teamId);
  if (!team) {
    const e = new Error('Team not found') as Error & { status: number };
    e.status = 404;
    throw e;
  }
  const member = await memberRepository.findById(memberId);
  if (!member) {
    const e = new Error('Member not found') as Error & { status: number };
    e.status = 404;
    throw e;
  }
  const updated = await teamRepository.addMember(teamId, memberId);
  logger.info('teamService.addMember success', { teamId, memberId });
  return updated;
}

export async function removeMember(teamId: string, memberId: string) {
  logger.debug('teamService.removeMember', { teamId, memberId });
  const team = await teamRepository.findById(teamId);
  if (!team) {
    const e = new Error('Team not found') as Error & { status: number };
    e.status = 404;
    throw e;
  }
  const updated = await teamRepository.removeMember(teamId, memberId);
  logger.info('teamService.removeMember success', { teamId, memberId });
  return updated;
}
