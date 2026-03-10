import User from '../models/User';

export const findByEmail = (email: string) => User.findOne({ email }).lean();

export const findById = (id: string) => User.findById(id).lean();

export const findAll = () => User.find().select('-passwordHash').lean();

export const create = (data: Record<string, unknown>) => User.create(data);

export const findByMicrosoftId = (microsoftId: string) => User.findOne({ microsoftId }).lean();

export const updateById = (id: string, data: Record<string, unknown>) =>
  User.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true })
    .select('-passwordHash')
    .lean();
