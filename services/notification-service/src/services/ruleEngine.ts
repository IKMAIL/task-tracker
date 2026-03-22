import { INotification } from '../models/Notification';
import { INotificationRule, ICondition, IConditionGroup, RuleAction } from '../models/NotificationRule';
import { logger } from '@task-tracker/utils';

const EVAL_TIMEOUT_MS = 100;

export interface RuleResult {
  suppress: boolean;
  overrideSeverity?: 'low' | 'medium' | 'high' | 'critical';
  overrideChannels?: string[];
  tags: string[];
  matchedRuleIds: string[];
}

type NotifContext = Record<string, unknown>;

function getField(notification: INotification, field: string): unknown {
  if (field.startsWith('metadata.')) {
    const sub = field.slice('metadata.'.length);
    return (notification.metadata as Record<string, unknown>)[sub];
  }
  return (notification as unknown as NotifContext)[field];
}

function evalCondition(notification: INotification, cond: ICondition): boolean {
  const actual = getField(notification, cond.field);
  const { op, value } = cond;

  switch (op) {
    case 'eq':          return actual === value;
    case 'neq':         return actual !== value;
    case 'gt':          return typeof actual === 'number' && actual > (value as number);
    case 'lt':          return typeof actual === 'number' && actual < (value as number);
    case 'gte':         return typeof actual === 'number' && actual >= (value as number);
    case 'lte':         return typeof actual === 'number' && actual <= (value as number);
    case 'contains':
      return typeof actual === 'string' && actual.toLowerCase().includes(String(value).toLowerCase());
    case 'not_contains':
      return typeof actual === 'string' && !actual.toLowerCase().includes(String(value).toLowerCase());
    case 'in':
      return Array.isArray(value) && value.includes(actual as string);
    case 'not_in':
      return Array.isArray(value) && !value.includes(actual as string);
    default:
      return false;
  }
}

function evalGroup(notification: INotification, group: IConditionGroup): boolean {
  if (!group.conditions || group.conditions.length === 0) return false;

  if (group.logic === 'AND') {
    return group.conditions.every((c) => evalCondition(notification, c));
  }
  return group.conditions.some((c) => evalCondition(notification, c));
}

function applyAction(result: RuleResult, action: RuleAction): void {
  switch (action.kind) {
    case 'suppress':
      result.suppress = true;
      break;
    case 'set_severity':
      result.overrideSeverity = action.severity;
      break;
    case 'route_channel':
      result.overrideChannels = action.channels;
      break;
    case 'add_tag':
      result.tags.push(action.tag);
      break;
  }
}

async function evaluateWithTimeout(
  notification: INotification,
  rules: INotificationRule[]
): Promise<RuleResult> {
  const result: RuleResult = {
    suppress: false,
    tags: [],
    matchedRuleIds: [],
  };

  const evalPromise = new Promise<RuleResult>((resolve) => {
    for (const rule of rules) {
      if (!rule.isActive) continue;
      try {
        const matched = evalGroup(notification, rule.conditionGroup);
        if (matched) {
          result.matchedRuleIds.push((rule._id as { toString(): string }).toString());
          for (const action of rule.actions) {
            applyAction(result, action);
          }
        }
      } catch (err) {
        logger.warn('ruleEngine: error evaluating rule', {
          ruleId: rule._id,
          error: (err as Error).message,
        });
      }
    }
    resolve(result);
  });

  const timeoutPromise = new Promise<RuleResult>((_, reject) =>
    setTimeout(() => reject(new Error('rule eval timeout')), EVAL_TIMEOUT_MS)
  );

  return Promise.race([evalPromise, timeoutPromise]);
}

export async function evaluateRules(
  notification: INotification,
  rules: INotificationRule[]
): Promise<RuleResult> {
  if (!rules || rules.length === 0) {
    return { suppress: false, tags: [], matchedRuleIds: [] };
  }

  try {
    return await evaluateWithTimeout(notification, rules);
  } catch (err) {
    logger.warn('ruleEngine: evaluation failed/timed-out', { error: (err as Error).message });
    return { suppress: false, tags: [], matchedRuleIds: [] };
  }
}
