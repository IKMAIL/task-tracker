import React, { useEffect, useState, useCallback } from 'react';
import {
  getPreferences,
  updatePreferences,
  getRules,
  createRule,
  updateRule,
  deleteRule,
  NotificationPreferences,
  NotificationRule,
  ChannelPreference,
} from '../api/preferencesApi';

// ── Types ─────────────────────────────────────────────────────────────────────
type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
type ChannelKey = 'inApp' | 'email' | 'push' | 'slack';

const NOTIFICATION_TYPES = [
  'past_due', 'update_overdue', 'behind_schedule', 'stalled',
  'task_assigned', 'task_status_changed', 'task_reassigned',
  'comment_added', 'mentioned', 'progress_updated',
  'escalation_triggered', 'custom_rule_triggered',
];

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'Europe/London', 'Europe/Paris',
  'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata',
  'Australia/Sydney',
];

const CHANNEL_LABELS: Record<ChannelKey, string> = {
  inApp: 'In-App',
  email: 'Email',
  push: 'Push',
  slack: 'Slack',
};

const SEVERITY_ORDER: SeverityLevel[] = ['low', 'medium', 'high', 'critical'];

const DEFAULT_PREFS: NotificationPreferences = {
  channels: {
    inApp: { enabled: true,  minSeverity: 'low' },
    email: { enabled: false, minSeverity: 'low' },
    push:  { enabled: false, minSeverity: 'medium' },
    slack: { enabled: false, minSeverity: 'high' },
  },
  mutedTypes: [],
  quietHours: { enabled: false, timezone: 'UTC', startHour: 22, endHour: 8 },
};

// ── Small reusable toggle ─────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`pref-toggle ${checked ? 'pref-toggle--on' : ''}`}
    >
      <span className="pref-toggle__knob" />
    </button>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="pref-section">
      <div className="pref-section__header">
        <h2 className="pref-section__title">{title}</h2>
        {subtitle && <p className="pref-section__sub">{subtitle}</p>}
      </div>
      <div className="pref-section__body">{children}</div>
    </section>
  );
}

// ── Rule editor modal ────────────────────────────────────────────────────────
function RuleModal({
  rule,
  onSave,
  onClose,
}: {
  rule: Partial<NotificationRule> | null;
  onSave: (data: Partial<NotificationRule>) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(rule?.name ?? '');
  const [logic, setLogic] = useState<'AND' | 'OR'>(rule?.conditionGroup?.logic ?? 'AND');
  const [conditions, setConditions] = useState(
    rule?.conditionGroup?.conditions ?? [{ field: 'severity', op: 'eq', value: 'high' }]
  );
  const [actionKind, setActionKind] = useState(rule?.actions?.[0]?.kind ?? 'suppress');
  const [saving, setSaving] = useState(false);

  const addCondition = () =>
    setConditions((prev) => [...prev, { field: 'type', op: 'eq', value: '' }]);

  const removeCondition = (i: number) =>
    setConditions((prev) => prev.filter((_, idx) => idx !== i));

  const updateCond = (i: number, key: string, val: string) =>
    setConditions((prev) => prev.map((c, idx) => (idx === i ? { ...c, [key]: val } : c)));

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onSave({
      name,
      isActive: rule?.isActive ?? true,
      priority: rule?.priority ?? 0,
      conditionGroup: { logic, conditions },
      actions: [{ kind: actionKind }],
    });
    setSaving(false);
  };

  return (
    <div className="pref-modal-overlay" onClick={onClose}>
      <div className="pref-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pref-modal__header">
          <h3>{rule?._id ? 'Edit Rule' : 'New Rule'}</h3>
          <button className="pref-modal__close" onClick={onClose}>×</button>
        </div>

        <div className="pref-modal__body">
          <label className="pref-label">Rule name
            <input className="pref-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mute low-priority task updates" />
          </label>

          <div className="pref-rule-logic">
            <span className="pref-label--sm">Match</span>
            {(['AND', 'OR'] as const).map((l) => (
              <button key={l} type="button" className={`pref-chip ${logic === l ? 'pref-chip--active' : ''}`} onClick={() => setLogic(l)}>{l}</button>
            ))}
            <span className="pref-label--sm">of these conditions:</span>
          </div>

          {conditions.map((cond, i) => (
            <div key={i} className="pref-condition-row">
              <select className="pref-select" value={cond.field} onChange={(e) => updateCond(i, 'field', e.target.value)}>
                <option value="type">Type</option>
                <option value="severity">Severity</option>
                <option value="sourceType">Source</option>
              </select>
              <select className="pref-select" value={cond.op} onChange={(e) => updateCond(i, 'op', e.target.value)}>
                <option value="eq">equals</option>
                <option value="neq">not equals</option>
                <option value="in">is one of</option>
                <option value="contains">contains</option>
              </select>
              <input className="pref-input pref-input--sm" value={String(cond.value)} onChange={(e) => updateCond(i, 'value', e.target.value)} placeholder="value" />
              <button type="button" className="pref-btn-icon" onClick={() => removeCondition(i)}>✕</button>
            </div>
          ))}

          <button type="button" className="pref-btn pref-btn--ghost" onClick={addCondition}>+ Add condition</button>

          <label className="pref-label" style={{ marginTop: '16px' }}>Action
            <select className="pref-select" value={actionKind} onChange={(e) => setActionKind(e.target.value)}>
              <option value="suppress">Suppress notification</option>
              <option value="set_severity">Override severity</option>
              <option value="route_channel">Route to channels</option>
              <option value="add_tag">Add tag</option>
            </select>
          </label>
        </div>

        <div className="pref-modal__footer">
          <button type="button" className="pref-btn pref-btn--ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="pref-btn pref-btn--primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save rule'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PreferencesPage() {
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS);
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [editingRule, setEditingRule] = useState<Partial<NotificationRule> | null | undefined>(undefined);

  useEffect(() => {
    Promise.all([getPreferences(), getRules()])
      .then(([p, r]) => {
        if (p?.data) setPrefs(p.data);
        if (r?.data) setRules(r.data);
      })
      .catch(() => {/* use defaults */})
      .finally(() => setLoading(false));
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await updatePreferences(prefs);
      if (res?.data) setPrefs(res.data);
      setSaveMsg('Preferences saved');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch {
      setSaveMsg('Failed to save');
    } finally {
      setSaving(false);
    }
  }, [prefs]);

  const setChannel = (ch: ChannelKey, patch: Partial<ChannelPreference>) =>
    setPrefs((p) => ({ ...p, channels: { ...p.channels, [ch]: { ...p.channels[ch], ...patch } } }));

  const toggleMuted = (type: string) =>
    setPrefs((p) => ({
      ...p,
      mutedTypes: p.mutedTypes.includes(type)
        ? p.mutedTypes.filter((t) => t !== type)
        : [...p.mutedTypes, type],
    }));

  const handleSaveRule = async (data: Partial<NotificationRule>) => {
    if (editingRule?._id) {
      const res = await updateRule(editingRule._id, data);
      setRules((prev) => prev.map((r) => (r._id === editingRule._id ? res.data : r)));
    } else {
      const res = await createRule(data as Omit<NotificationRule, '_id' | 'matchCount'>);
      setRules((prev) => [...prev, res.data]);
    }
    setEditingRule(undefined);
  };

  const handleDeleteRule = async (id: string) => {
    await deleteRule(id);
    setRules((prev) => prev.filter((r) => r._id !== id));
  };

  if (loading) return <div className="page-container"><p className="text-muted">Loading preferences…</p></div>;

  return (
    <div className="page-container pref-page">
      <div className="pref-header">
        <div>
          <h1 className="pref-page-title">Notification Preferences</h1>
          <p className="pref-page-sub">Control how and when you receive notifications</p>
        </div>
        <div className="pref-header-actions">
          {saveMsg && <span className={`pref-save-msg ${saveMsg.includes('Failed') ? 'pref-save-msg--error' : ''}`}>{saveMsg}</span>}
          <button className="pref-btn pref-btn--primary" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>

      {/* ── Channels ─────────────────────────────────────────────────────── */}
      <Section title="Delivery channels" subtitle="Choose which channels receive notifications and the minimum severity threshold.">
        <div className="pref-channels-grid">
          {(Object.keys(CHANNEL_LABELS) as ChannelKey[]).map((ch) => {
            const cfg = prefs.channels[ch];
            return (
              <div key={ch} className={`pref-channel-card ${cfg.enabled ? 'pref-channel-card--on' : ''}`}>
                <div className="pref-channel-card__top">
                  <span className="pref-channel-name">{CHANNEL_LABELS[ch]}</span>
                  <Toggle checked={cfg.enabled} onChange={(v) => setChannel(ch, { enabled: v })} />
                </div>
                {cfg.enabled && (
                  <label className="pref-label--sm">
                    Min severity
                    <select
                      className="pref-select pref-select--sm"
                      value={cfg.minSeverity}
                      onChange={(e) => setChannel(ch, { minSeverity: e.target.value as SeverityLevel })}
                    >
                      {SEVERITY_ORDER.map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── Quiet hours ──────────────────────────────────────────────────── */}
      <Section title="Quiet hours" subtitle="Suppress non-critical notifications during specified hours. In-App notifications are always delivered.">
        <div className="pref-quiet-hours">
          <div className="pref-quiet-hours__toggle">
            <span>Enable quiet hours</span>
            <Toggle
              checked={prefs.quietHours?.enabled ?? false}
              onChange={(v) =>
                setPrefs((p) => ({ ...p, quietHours: { ...DEFAULT_PREFS.quietHours!, ...p.quietHours, enabled: v } }))
              }
            />
          </div>
          {prefs.quietHours?.enabled && (
            <div className="pref-quiet-hours__config">
              <label className="pref-label--sm">
                Timezone
                <select
                  className="pref-select"
                  value={prefs.quietHours.timezone}
                  onChange={(e) =>
                    setPrefs((p) => ({ ...p, quietHours: { ...p.quietHours!, timezone: e.target.value } }))
                  }
                >
                  {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </label>
              <div className="pref-quiet-hours__range">
                <label className="pref-label--sm">
                  From
                  <input
                    type="number" min={0} max={23} className="pref-input pref-input--sm"
                    value={prefs.quietHours.startHour}
                    onChange={(e) =>
                      setPrefs((p) => ({ ...p, quietHours: { ...p.quietHours!, startHour: Number(e.target.value) } }))
                    }
                  />
                  :00
                </label>
                <label className="pref-label--sm">
                  To
                  <input
                    type="number" min={0} max={23} className="pref-input pref-input--sm"
                    value={prefs.quietHours.endHour}
                    onChange={(e) =>
                      setPrefs((p) => ({ ...p, quietHours: { ...p.quietHours!, endHour: Number(e.target.value) } }))
                    }
                  />
                  :00
                </label>
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* ── Muted types ──────────────────────────────────────────────────── */}
      <Section title="Muted notification types" subtitle="Completely suppress these notification types across all channels.">
        <div className="pref-muted-grid">
          {NOTIFICATION_TYPES.map((type) => {
            const muted = prefs.mutedTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleMuted(type)}
                className={`pref-type-chip ${muted ? 'pref-type-chip--muted' : ''}`}
              >
                {muted && <span className="pref-type-chip__icon">🔇</span>}
                {type.replace(/_/g, ' ')}
              </button>
            );
          })}
        </div>
      </Section>

      {/* ── Custom rules ─────────────────────────────────────────────────── */}
      <Section title="Custom rules" subtitle="Up to 50 rules evaluated in priority order. Rules run before channel preferences.">
        <div className="pref-rules-toolbar">
          <span className="pref-rules-count">{rules.length} / 50 rules</span>
          <button
            type="button"
            className="pref-btn pref-btn--primary"
            onClick={() => setEditingRule({})}
            disabled={rules.length >= 50}
          >
            + New rule
          </button>
        </div>

        {rules.length === 0 ? (
          <p className="pref-empty">No custom rules. Create one to suppress, re-route, or tag notifications automatically.</p>
        ) : (
          <ul className="pref-rules-list">
            {rules.map((rule) => (
              <li key={rule._id} className={`pref-rule-item ${rule.isActive ? '' : 'pref-rule-item--off'}`}>
                <div className="pref-rule-item__main">
                  <Toggle
                    checked={rule.isActive}
                    onChange={async (v) => {
                      const res = await updateRule(rule._id, { isActive: v });
                      setRules((prev) => prev.map((r) => (r._id === rule._id ? res.data : r)));
                    }}
                  />
                  <span className="pref-rule-name">{rule.name}</span>
                  <span className="pref-rule-meta">
                    {rule.conditionGroup.logic} · {rule.conditionGroup.conditions.length} condition(s) ·
                    matched {rule.matchCount}×
                  </span>
                </div>
                <div className="pref-rule-item__actions">
                  <button type="button" className="pref-btn pref-btn--ghost pref-btn--sm" onClick={() => setEditingRule(rule)}>Edit</button>
                  <button type="button" className="pref-btn pref-btn--danger pref-btn--sm" onClick={() => handleDeleteRule(rule._id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* ── Rule modal ───────────────────────────────────────────────────── */}
      {editingRule !== undefined && (
        <RuleModal
          rule={editingRule}
          onSave={handleSaveRule}
          onClose={() => setEditingRule(undefined)}
        />
      )}
    </div>
  );
}
