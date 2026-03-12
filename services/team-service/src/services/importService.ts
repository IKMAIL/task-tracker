import * as teamRepository from '../repositories/teamRepository';
import * as memberRepository from '../repositories/memberRepository';
import { logger } from '@task-tracker/utils';
import { ParsedRow } from '../utils/parseFile';

export interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

export async function importTeams(rows: ParsedRow[]): Promise<ImportResult> {
  logger.debug('importService.importTeams', { rowCount: rows.length });
  const result: ImportResult = { created: 0, updated: 0, skipped: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // 1-indexed + header row
    try {
      const name = (row.name as string || '').trim();
      if (!name) {
        result.errors.push({ row: rowNum, message: 'Missing required field: name' });
        continue;
      }

      const data: Record<string, unknown> = {
        name,
        description: (row.description as string || '').trim(),
      };

      const existing = await teamRepository.findByName(name);
      if (existing) {
        await teamRepository.updateById(String(existing._id), data);
        result.updated++;
      } else {
        await teamRepository.create(data);
        result.created++;
      }
    } catch (err) {
      result.errors.push({ row: rowNum, message: (err as Error).message });
    }
  }

  logger.info('importService.importTeams done', { ...result, errorCount: result.errors.length });
  return result;
}

export async function importMembers(rows: ParsedRow[]): Promise<ImportResult> {
  logger.debug('importService.importMembers', { rowCount: rows.length });
  const result: ImportResult = { created: 0, updated: 0, skipped: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;
    try {
      const name = (row.name as string || '').trim();
      const loginId = (row.loginId as string || '').trim();
      if (!name) {
        result.errors.push({ row: rowNum, message: 'Missing required field: name' });
        continue;
      }
      if (!loginId) {
        result.errors.push({ row: rowNum, message: 'Missing required field: loginId' });
        continue;
      }

      const data: Record<string, unknown> = {
        name,
        loginId,
        position: (row.position as string || '').trim(),
      };
      if (row.birthday) data.birthday = new Date(row.birthday as string);
      if (row.joiningDate) data.joiningDate = new Date(row.joiningDate as string);

      const existing = await memberRepository.findByLoginId(loginId);
      if (existing) {
        await memberRepository.updateById(String(existing._id), data);
        result.updated++;
      } else {
        await memberRepository.create(data);
        result.created++;
      }
    } catch (err) {
      result.errors.push({ row: rowNum, message: (err as Error).message });
    }
  }

  logger.info('importService.importMembers done', { ...result, errorCount: result.errors.length });
  return result;
}

export async function importTeamMembers(rows: ParsedRow[]): Promise<ImportResult> {
  logger.debug('importService.importTeamMembers', { rowCount: rows.length });
  const result: ImportResult = { created: 0, updated: 0, skipped: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;
    try {
      const teamName = (row.teamName as string || '').trim();
      const memberLoginId = (row.memberLoginId as string || '').trim();

      if (!teamName) {
        result.errors.push({ row: rowNum, message: 'Missing required field: teamName' });
        continue;
      }
      if (!memberLoginId) {
        result.errors.push({ row: rowNum, message: 'Missing required field: memberLoginId' });
        continue;
      }

      const team = await teamRepository.findByName(teamName);
      if (!team) {
        result.errors.push({ row: rowNum, message: `Team not found: ${teamName}` });
        continue;
      }

      const member = await memberRepository.findByLoginId(memberLoginId);
      if (!member) {
        result.errors.push({ row: rowNum, message: `Member not found: ${memberLoginId}` });
        continue;
      }

      const memberIds = (team.memberIds || []).map((m: any) =>
        String(m._id || m)
      );
      if (memberIds.includes(String(member._id))) {
        result.skipped++;
      } else {
        await teamRepository.addMember(String(team._id), String(member._id));
        result.created++;
      }
    } catch (err) {
      result.errors.push({ row: rowNum, message: (err as Error).message });
    }
  }

  logger.info('importService.importTeamMembers done', { ...result, errorCount: result.errors.length });
  return result;
}
