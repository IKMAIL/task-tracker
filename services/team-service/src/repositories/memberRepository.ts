import Member from '../models/Member';
import { logger } from '@task-tracker/utils';

export const findAll = async () => {
  logger.debug('memberRepository.findAll');
  const members = await Member.find().lean();
  logger.debug('memberRepository.findAll result', { count: members.length });
  return members;
};

export const findById = async (id: string) => {
  logger.debug('memberRepository.findById', { id });
  const member = await Member.findById(id).lean();
  logger.debug('memberRepository.findById result', { id, found: !!member });
  return member;
};

export const findByLoginId = async (loginId: string) => {
  logger.debug('memberRepository.findByLoginId', { loginId });
  const member = await Member.findOne({ loginId }).lean();
  logger.debug('memberRepository.findByLoginId result', { loginId, found: !!member });
  return member;
};

export const create = async (data: Record<string, unknown>) => {
  logger.debug('memberRepository.create', { data });
  const member = await Member.create(data);
  logger.debug('memberRepository.create result', { memberId: String(member._id) });
  return member;
};

export const updateById = async (id: string, data: Record<string, unknown>) => {
  logger.debug('memberRepository.updateById', { id, data });
  const member = await Member.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).lean();
  logger.debug('memberRepository.updateById result', { id, found: !!member });
  return member;
};

export const deleteById = async (id: string) => {
  logger.debug('memberRepository.deleteById', { id });
  const member = await Member.findByIdAndDelete(id).lean();
  logger.debug('memberRepository.deleteById result', { id, found: !!member });
  return member;
};
