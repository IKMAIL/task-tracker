import Team from '../models/Team';

export const findAll = () => Team.find().lean();

export const findById = (id: string) => Team.findById(id).lean();

export const findByName = (name: string) => Team.findOne({ name }).lean();

export const create = (data: Record<string, unknown>) => Team.create(data);

export const updateById = (id: string, data: Record<string, unknown>) =>
  Team.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).lean();

export const addMember = (teamId: string, userId: string) =>
  Team.findByIdAndUpdate(teamId, { $addToSet: { memberIds: userId } }, { new: true }).lean();

export const removeMember = (teamId: string, userId: string) =>
  Team.findByIdAndUpdate(teamId, { $pull: { memberIds: userId } }, { new: true }).lean();
