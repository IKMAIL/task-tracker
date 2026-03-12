import { Schema, Model, Document } from 'mongoose';
import { logger } from './logger';

export interface IAuditLog {
  resourceType: string;
  resourceId: string;
  action: 'create' | 'update' | 'delete';
  userId: string | null;
  userEmail: string | null;
  changes: {
    before: Record<string, unknown> | null;
    after: Record<string, unknown> | null;
  };
  timestamp: Date;
}

export interface AuditUser {
  userId: string;
  userEmail: string;
}

/**
 * Creates a Mongoose plugin that writes to an audit_logs collection on every
 * create, update, or delete operation.
 *
 * Usage:
 *   import AuditLog from '../models/AuditLog';
 *   import { createAuditPlugin } from '@task-tracker/utils';
 *   MySchema.plugin(createAuditPlugin(AuditLog, 'myResource'));
 *
 * Threading userId for updates/deletes:
 *   Pass { auditUser: { userId, userEmail } } in Mongoose query options.
 *   e.g. Model.findByIdAndUpdate(id, data, { new: true, auditUser: { userId, userEmail } })
 *
 * For creates:
 *   userId is read from doc.createdBy or doc.authorId automatically.
 */
export function createAuditPlugin(AuditLog: Model<Document & IAuditLog>, resourceType: string) {
  return function auditPlugin(schema: Schema): void {
    // ── Creates ──────────────────────────────────────────────────────────────

    schema.pre('save', function () {
      (this as any).$locals._wasNew = this.isNew;
    });

    schema.post('save', async function (doc: any) {
      if (!doc.$locals?._wasNew) return;
      try {
        const userId = doc.createdBy ? String(doc.createdBy) : (doc.authorId ? String(doc.authorId) : null);
        await AuditLog.create({
          resourceType,
          resourceId: String(doc._id),
          action: 'create',
          userId,
          userEmail: null,
          changes: { before: null, after: doc.toObject ? doc.toObject() : doc },
          timestamp: new Date(),
        });
      } catch (err) {
        logger.error('auditPlugin: failed to write create audit', { resourceType, error: (err as Error).message });
      }
    });

    // ── Updates ──────────────────────────────────────────────────────────────

    schema.pre('findOneAndUpdate', async function () {
      try {
        const doc = await (this as any).model.findOne(this.getFilter()).lean();
        (this as any)._auditBefore = doc;
      } catch (err) {
        logger.error('auditPlugin: failed to capture before state', { resourceType, error: (err as Error).message });
      }
    });

    schema.post('findOneAndUpdate', async function (doc: any) {
      try {
        const before = (this as any)._auditBefore ?? null;
        const opts = this.getOptions() as any;
        const auditUser: Partial<AuditUser> = opts.auditUser ?? {};
        await AuditLog.create({
          resourceType,
          resourceId: String(doc?._id ?? before?._id ?? 'unknown'),
          action: 'update',
          userId: auditUser.userId ?? null,
          userEmail: auditUser.userEmail ?? null,
          changes: { before, after: doc },
          timestamp: new Date(),
        });
      } catch (err) {
        logger.error('auditPlugin: failed to write update audit', { resourceType, error: (err as Error).message });
      }
    });

    // ── Deletes ──────────────────────────────────────────────────────────────

    schema.pre('findOneAndDelete', async function () {
      try {
        const doc = await (this as any).model.findOne(this.getFilter()).lean();
        (this as any)._auditDoc = doc;
      } catch (err) {
        logger.error('auditPlugin: failed to capture doc before delete', { resourceType, error: (err as Error).message });
      }
    });

    schema.post('findOneAndDelete', async function () {
      try {
        const doc = (this as any)._auditDoc ?? null;
        const opts = this.getOptions() as any;
        const auditUser: Partial<AuditUser> = opts.auditUser ?? {};
        await AuditLog.create({
          resourceType,
          resourceId: String(doc?._id ?? 'unknown'),
          action: 'delete',
          userId: auditUser.userId ?? null,
          userEmail: auditUser.userEmail ?? null,
          changes: { before: doc, after: null },
          timestamp: new Date(),
        });
      } catch (err) {
        logger.error('auditPlugin: failed to write delete audit', { resourceType, error: (err as Error).message });
      }
    });
  };
}
