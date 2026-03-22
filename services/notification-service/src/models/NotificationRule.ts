import mongoose, { Document, Schema } from 'mongoose';

export type ConditionOperator = 'eq' | 'neq' | 'contains' | 'not_contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'not_in';
export type ConditionField =
  | 'type'
  | 'severity'
  | 'sourceType'
  | 'actorId'
  | 'metadata.taskId'
  | 'metadata.teamId'
  | 'title'
  | 'body';

export type RuleLogic = 'AND' | 'OR';

export interface ICondition {
  field: ConditionField;
  op: ConditionOperator;
  value: string | number | string[];
}

export interface IConditionGroup {
  logic: RuleLogic;
  conditions: ICondition[];
}

export type RuleAction =
  | { kind: 'suppress' }
  | { kind: 'set_severity'; severity: 'low' | 'medium' | 'high' | 'critical' }
  | { kind: 'route_channel'; channels: string[] }
  | { kind: 'add_tag'; tag: string };

export interface INotificationRule extends Document {
  userId: string;
  name: string;
  description?: string;
  isActive: boolean;
  priority: number;
  conditionGroup: IConditionGroup;
  actions: RuleAction[];
  matchCount: number;
  lastMatchedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ConditionSchema = new Schema<ICondition>(
  {
    field: { type: String, required: true },
    op:    { type: String, enum: ['eq','neq','contains','not_contains','gt','lt','gte','lte','in','not_in'], required: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const ConditionGroupSchema = new Schema<IConditionGroup>(
  {
    logic:      { type: String, enum: ['AND', 'OR'], default: 'AND' },
    conditions: { type: [ConditionSchema], default: [] },
  },
  { _id: false }
);

const ActionSchema = new Schema(
  {
    kind:     { type: String, required: true },
    severity: { type: String },
    channels: { type: [String] },
    tag:      { type: String },
  },
  { _id: false }
);

const NotificationRuleSchema = new Schema<INotificationRule>(
  {
    userId:         { type: String, required: true },
    name:           { type: String, required: true, maxlength: 100 },
    description:    { type: String, maxlength: 500 },
    isActive:       { type: Boolean, default: true },
    priority:       { type: Number, default: 0 },
    conditionGroup: { type: ConditionGroupSchema, required: true },
    actions:        { type: [ActionSchema], required: true },
    matchCount:     { type: Number, default: 0 },
    lastMatchedAt:  { type: Date },
  },
  { timestamps: true }
);

NotificationRuleSchema.index({ userId: 1, isActive: 1, priority: -1 });

export default mongoose.model<INotificationRule>('NotificationRule', NotificationRuleSchema);
