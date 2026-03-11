import mongoose from 'mongoose';
import Alert, { AlertSeverity, AlertType, IAlert } from '../models/Alert';
import { logger } from '@task-tracker/utils';

export type AlertQuery = {
  teamId?: string | mongoose.Types.ObjectId;
  type?: AlertType;
  severity?: AlertSeverity;
};

export const findActive = async (query: AlertQuery = {}): Promise<IAlert[]> => {
  logger.debug('alertRepository.findActive', { query });
  const alerts = await Alert.find({ ...query, isActive: true }).sort({ createdAt: -1 }).lean() as unknown as IAlert[];
  logger.debug('alertRepository.findActive result', { query, count: alerts.length });
  return alerts;
};

export const findActiveByTaskAndType = async (
  taskId: string | mongoose.Types.ObjectId,
  type: AlertType
): Promise<IAlert | null> => {
  logger.debug('alertRepository.findActiveByTaskAndType', { taskId, type });
  const alert = await Alert.findOne({ taskId, type, isActive: true }).lean() as unknown as IAlert | null;
  logger.debug('alertRepository.findActiveByTaskAndType result', { taskId, type, found: !!alert, alert });
  return alert;
};

export const findById = async (id: string | mongoose.Types.ObjectId): Promise<IAlert | null> => {
  logger.debug('alertRepository.findById', { id });
  const alert = await Alert.findById(id).lean() as unknown as IAlert | null;
  logger.debug('alertRepository.findById result', { id, found: !!alert, alert });
  return alert;
};

export const create = async (data: Partial<IAlert>): Promise<IAlert> => {
  logger.debug('alertRepository.create', { data });
  const alert = await Alert.create(data);
  logger.debug('alertRepository.create result', { alertId: String(alert._id) });
  return alert;
};

export const updateById = async (
  id: string | mongoose.Types.ObjectId,
  data: Partial<IAlert>
): Promise<IAlert | null> => {
  logger.debug('alertRepository.updateById', { id, data });
  const alert = await Alert.findByIdAndUpdate(id, { $set: data }, { new: true }).lean() as unknown as IAlert | null;
  logger.debug('alertRepository.updateById result', { id, found: !!alert, alert });
  return alert;
};

export const resolveByTaskAndType = async (
  taskId: string | mongoose.Types.ObjectId,
  type: AlertType
): Promise<mongoose.UpdateWriteOpResult> => {
  logger.debug('alertRepository.resolveByTaskAndType', { taskId, type });
  const result = await Alert.updateOne(
    { taskId, type, isActive: true },
    { $set: { isActive: false, resolvedAt: new Date() } }
  );
  logger.debug('alertRepository.resolveByTaskAndType result', { taskId, type, modifiedCount: result.modifiedCount });
  return result;
};

export const resolveById = async (
  id: string | mongoose.Types.ObjectId
): Promise<IAlert | null> => {
  logger.debug('alertRepository.resolveById', { id });
  const alert = await Alert.findByIdAndUpdate(
    id,
    { $set: { isActive: false, resolvedAt: new Date() } },
    { new: true }
  ).lean() as unknown as IAlert | null;
  logger.debug('alertRepository.resolveById result', { id, found: !!alert, alert });
  return alert;
};
