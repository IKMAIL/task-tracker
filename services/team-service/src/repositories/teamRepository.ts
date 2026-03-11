import Team from '../models/Team';
import '../models/Member';
import { logger } from '@task-tracker/utils';

export const findAll = async () => {
  logger.debug('teamRepository.findAll');
  const teams = await Team.find().populate('memberIds').lean();
  logger.debug('teamRepository.findAll result', { count: teams.length });
  return teams;
};

export const findById = async (id: string) => {
  logger.debug('teamRepository.findById', { id });
  const team = await Team.findById(id).populate('memberIds').lean();
  logger.debug('teamRepository.findById result', { id, found: !!team });
  return team;
};

export const findByName = async (name: string) => {
  logger.debug('teamRepository.findByName', { name });
  const team = await Team.findOne({ name }).lean();
  logger.debug('teamRepository.findByName result', { name, found: !!team });
  return team;
};

export const create = async (data: Record<string, unknown>) => {
  logger.debug('teamRepository.create', { data });
  const team = await Team.create(data);
  logger.debug('teamRepository.create result', { teamId: String(team._id) });
  return team;
};

export const updateById = async (id: string, data: Record<string, unknown>) => {
  logger.debug('teamRepository.updateById', { id, data });
  const team = await Team.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).lean();
  logger.debug('teamRepository.updateById result', { id, found: !!team });
  return team;
};

export const deleteById = async (id: string) => {
  logger.debug('teamRepository.deleteById', { id });
  const team = await Team.findByIdAndDelete(id).lean();
  logger.debug('teamRepository.deleteById result', { id, found: !!team });
  return team;
};

export const addMember = async (teamId: string, memberId: string) => {
  logger.debug('teamRepository.addMember', { teamId, memberId });
  const team = await Team.findByIdAndUpdate(teamId, { $addToSet: { memberIds: memberId } }, { new: true }).populate('memberIds').lean();
  logger.debug('teamRepository.addMember result', { teamId, memberId });
  return team;
};

export const removeMember = async (teamId: string, memberId: string) => {
  logger.debug('teamRepository.removeMember', { teamId, memberId });
  const team = await Team.findByIdAndUpdate(teamId, { $pull: { memberIds: memberId } }, { new: true }).populate('memberIds').lean();
  logger.debug('teamRepository.removeMember result', { teamId, memberId });
  return team;
};

export const clearMemberFromAllTeams = async (memberId: string) => {
  logger.debug('teamRepository.clearMemberFromAllTeams', { memberId });
  await Team.updateMany({}, { $pull: { memberIds: memberId } });
};
