import mongoose from 'mongoose';
import Alert, { AlertSeverity, AlertType, IAlert } from '../models/Alert';

export type AlertQuery = {
  teamId?: string | mongoose.Types.ObjectId;
  type?: AlertType;
  severity?: AlertSeverity;
};

export const findActive = (query: AlertQuery = {}): Promise<IAlert[]> =>
  Alert.find({ ...query, isActive: true }).sort({ createdAt: -1 }).lean() as unknown as Promise<IAlert[]>;

export const findActiveByTaskAndType = (
  taskId: string | mongoose.Types.ObjectId,
  type: AlertType
): Promise<IAlert | null> =>
  Alert.findOne({ taskId, type, isActive: true }).lean() as unknown as Promise<IAlert | null>;

export const findById = (id: string | mongoose.Types.ObjectId): Promise<IAlert | null> =>
  Alert.findById(id).lean() as unknown as Promise<IAlert | null>;

export const create = (data: Partial<IAlert>): Promise<IAlert> =>
  Alert.create(data);

export const updateById = (
  id: string | mongoose.Types.ObjectId,
  data: Partial<IAlert>
): Promise<IAlert | null> =>
  Alert.findByIdAndUpdate(id, { $set: data }, { new: true }).lean() as unknown as Promise<IAlert | null>;

export const resolveByTaskAndType = (
  taskId: string | mongoose.Types.ObjectId,
  type: AlertType
): Promise<mongoose.UpdateWriteOpResult> =>
  Alert.updateOne(
    { taskId, type, isActive: true },
    { $set: { isActive: false, resolvedAt: new Date() } }
  );

export const resolveById = (
  id: string | mongoose.Types.ObjectId
): Promise<IAlert | null> =>
  Alert.findByIdAndUpdate(
    id,
    { $set: { isActive: false, resolvedAt: new Date() } },
    { new: true }
  ).lean() as unknown as Promise<IAlert | null>;
