import * as memberRepository from '../repositories/memberRepository';
import * as teamRepository from '../repositories/teamRepository';
import { logger, AuditUser } from '@task-tracker/utils';

export async function listMembers() {
  logger.debug('memberService.listMembers');
  const members = await memberRepository.findAll();
  logger.debug('memberService.listMembers result', { count: members.length });
  return members;
}

export async function getMember(id: string) {
  logger.debug('memberService.getMember', { id });
  const member = await memberRepository.findById(id);
  if (!member) {
    const err = new Error('Member not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }
  return member;
}

export async function createMember(data: Record<string, unknown>) {
  logger.debug('memberService.createMember', { data });
  const existing = await memberRepository.findByLoginId(data.loginId as string);
  if (existing) {
    const err = new Error('A member with this loginId already exists') as Error & { status: number };
    err.status = 409;
    throw err;
  }
  const member = await memberRepository.create(data);
  logger.info('memberService.createMember success', { memberId: String(member._id) });
  return member;
}

export async function updateMember(id: string, data: Record<string, unknown>, auditUser?: AuditUser) {
  logger.debug('memberService.updateMember', { id, data });
  const member = await memberRepository.findById(id);
  if (!member) {
    const err = new Error('Member not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }
  if (data.loginId && data.loginId !== member.loginId) {
    const existing = await memberRepository.findByLoginId(data.loginId as string);
    if (existing) {
      const err = new Error('A member with this loginId already exists') as Error & { status: number };
      err.status = 409;
      throw err;
    }
  }
  const updated = await memberRepository.updateById(id, data, auditUser);
  logger.info('memberService.updateMember success', { id });
  return updated;
}

export async function deleteMember(id: string, auditUser?: AuditUser) {
  logger.debug('memberService.deleteMember', { id });
  const member = await memberRepository.findById(id);
  if (!member) {
    const err = new Error('Member not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }
  await teamRepository.clearMemberFromAllTeams(id);
  await memberRepository.deleteById(id, auditUser);
  logger.info('memberService.deleteMember success', { id });
}
