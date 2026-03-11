import * as alertRepository from '../repositories/alertRepository';
import { AlertQuery } from '../repositories/alertRepository';
import { IAlert } from '../models/Alert';
import { logger } from '@task-tracker/utils';

export const listAlerts = async (filters: AlertQuery = {}): Promise<IAlert[]> => {
  const query: AlertQuery = {};
  if (filters.teamId)   query.teamId = filters.teamId;
  if (filters.type)     query.type = filters.type;
  if (filters.severity) query.severity = filters.severity;
  logger.debug('alertService.listAlerts', { query });
  const alerts = await alertRepository.findActive(query);
  logger.debug('alertService.listAlerts result', { count: alerts.length });
  return alerts;
};

export const getAlert = async (id: string): Promise<IAlert> => {
  logger.debug('alertService.getAlert', { id });
  const alert = await alertRepository.findById(id);
  if (!alert) {
    logger.debug('alertService.getAlert not found', { id });
    throw Object.assign(new Error('Alert not found'), { status: 404 });
  }
  logger.debug('alertService.getAlert result', { alert });
  return alert;
};

export const resolveAlert = async (id: string): Promise<IAlert> => {
  logger.debug('alertService.resolveAlert', { id });
  const alert = await alertRepository.resolveById(id);
  if (!alert) {
    logger.debug('alertService.resolveAlert not found', { id });
    throw Object.assign(new Error('Alert not found'), { status: 404 });
  }
  logger.debug('alertService.resolveAlert result', { alert });
  return alert;
};
