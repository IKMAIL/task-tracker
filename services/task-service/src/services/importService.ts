import Task from '../models/Task';
import { CATEGORIES, STATUSES } from '../models/Task';
import * as taskRepository from '../repositories/taskRepository';
import { logger } from '@task-tracker/utils';
import { ParsedRow } from '../utils/parseFile';

export interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

const validCategories = new Set<string>(CATEGORIES);
const validStatuses = new Set<string>(STATUSES);

export async function importTasks(
  rows: ParsedRow[],
  teamMap: Record<string, string>,
  createdBy: string
): Promise<ImportResult> {
  logger.debug('importService.importTasks', { rowCount: rows.length, teamMapSize: Object.keys(teamMap).length });
  const result: ImportResult = { created: 0, updated: 0, skipped: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // 1-indexed + header row
    try {
      const title = (row.title as string || '').trim();
      const teamName = (row.teamName as string || '').trim();
      const category = (row.category as string || '').trim();
      const status = (row.status as string || 'not_started').trim();
      const plannedStartDate = row.plannedStartDate as string || '';
      const dueDate = row.dueDate as string || '';

      if (!title) {
        result.errors.push({ row: rowNum, message: 'Missing required field: title' });
        continue;
      }
      if (!teamName) {
        result.errors.push({ row: rowNum, message: 'Missing required field: teamName' });
        continue;
      }
      if (!category) {
        result.errors.push({ row: rowNum, message: 'Missing required field: category' });
        continue;
      }
      if (!validCategories.has(category)) {
        result.errors.push({ row: rowNum, message: `Invalid category: ${category}. Valid: ${CATEGORIES.join(', ')}` });
        continue;
      }
      if (status && !validStatuses.has(status)) {
        result.errors.push({ row: rowNum, message: `Invalid status: ${status}. Valid: ${STATUSES.join(', ')}` });
        continue;
      }
      if (!plannedStartDate) {
        result.errors.push({ row: rowNum, message: 'Missing required field: plannedStartDate' });
        continue;
      }
      if (!dueDate) {
        result.errors.push({ row: rowNum, message: 'Missing required field: dueDate' });
        continue;
      }

      const assignedTeamId = teamMap[teamName];
      if (!assignedTeamId) {
        result.errors.push({ row: rowNum, message: `Team not found: ${teamName}` });
        continue;
      }

      const parsedStartDate = new Date(plannedStartDate);
      const parsedDueDate = new Date(dueDate);
      if (parsedDueDate <= parsedStartDate) {
        result.errors.push({ row: rowNum, message: 'Due date must be after planned start date' });
        continue;
      }

      const data: Record<string, unknown> = {
        title,
        description: (row.description as string || '').trim(),
        category,
        assignedTeamId,
        status,
        completionPct: row.completionPct ? Number(row.completionPct) : 0,
        plannedStartDate: parsedStartDate,
        dueDate: parsedDueDate,
      };
      if (row.nextUpdateDate) {
        data.nextUpdateDate = new Date(row.nextUpdateDate as string);
      }

      // Upsert: find by title + team
      const existing = await Task.findOne({ title, assignedTeamId }).lean();
      if (existing) {
        await taskRepository.updateById(String(existing._id), data as any);
        result.updated++;
      } else {
        data.createdBy = createdBy;
        await taskRepository.create(data as any);
        result.created++;
      }
    } catch (err) {
      result.errors.push({ row: rowNum, message: (err as Error).message });
    }
  }

  logger.info('importService.importTasks done', { ...result, errorCount: result.errors.length });
  return result;
}
