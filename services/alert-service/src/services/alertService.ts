import * as alertRepository from '../repositories/alertRepository';
import { AlertQuery } from '../repositories/alertRepository';
import { IAlert } from '../models/Alert';

export const listAlerts = (filters: AlertQuery = {}): Promise<IAlert[]> => {
  const query: AlertQuery = {};
  if (filters.teamId)   query.teamId = filters.teamId;
  if (filters.type)     query.type = filters.type;
  if (filters.severity) query.severity = filters.severity;
  return alertRepository.findActive(query);
};

export const getAlert = async (id: string): Promise<IAlert> => {
  const alert = await alertRepository.findById(id);
  if (!alert) {
    throw Object.assign(new Error('Alert not found'), { status: 404 });
  }
  return alert;
};

export const resolveAlert = async (id: string): Promise<IAlert> => {
  const alert = await alertRepository.resolveById(id);
  if (!alert) {
    throw Object.assign(new Error('Alert not found'), { status: 404 });
  }
  return alert;
};
