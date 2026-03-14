import React, { useRef, useState } from 'react';

interface Member { _id: string; name: string; loginId: string; }

interface MentionState {
  start: number;
  end: number;
  query: string;
  highlightIdx: number;
}

interface DateRange {
  start: number;
  end: number;
}

interface CommentInputProps {
  value: string;
  onChange: (val: string) => void;
  members: Member[];
  disabled?: boolean;
  maxLength?: number;
}

function detectMention(value: string, cursor: number): MentionState | null {
  const before = value.slice(0, cursor);
  const match = before.match(/@(\w*)$/);
  if (match) {
    return {
      start: cursor - match[0].length,
      end: cursor,
      query: match[1].toLowerCase(),
      highlightIdx: 0,
    };
  }
  return null;
}

function detectDate(value: string, cursor: number): DateRange | null {
  const before = value.slice(0, cursor);
  if (before.endsWith('//')) {
    return { start: cursor - 2, end: cursor };
  }
  return null;
}

export default function CommentInput({
  value, onChange, members, disabled = false, maxLength,
}: CommentInputProps): React.ReactElement {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mentionState, setMentionState] = useState<MentionState | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  const filtered = mentionState
    ? members.filter(
        (m) =>
          m.name.toLowerCase().includes(mentionState.query) ||
          m.loginId.toLowerCase().includes(mentionState.query)
      )
    : [];

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    const cursor = e.target.selectionStart ?? val.length;
    onChange(val);
    setMentionState(detectMention(val, cursor));
    setDateRange(detectDate(val, cursor));
  }

  function insertMention(member: Member) {
    if (!mentionState) return;
    const insert = `@${member.name} `;
    const newVal = value.slice(0, mentionState.start) + insert + value.slice(mentionState.end);
    onChange(newVal);
    setMentionState(null);
    const newCursor = mentionState.start + insert.length;
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(newCursor, newCursor);
    }, 0);
  }

  function insertDate(dateVal: string) {
    if (!dateRange) return;
    // Append T00:00:00 to avoid UTC-offset day-shift issues
    const label = new Date(dateVal + 'T00:00:00').toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
    const newVal = value.slice(0, dateRange.start) + label + value.slice(dateRange.end);
    onChange(newVal);
    const newCursor = dateRange.start + label.length;
    setDateRange(null);
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(newCursor, newCursor);
    }, 0);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!mentionState || filtered.length === 0) {
      if (e.key === 'Escape') {
        setMentionState(null);
        setDateRange(null);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setMentionState((s) => s ? { ...s, highlightIdx: (s.highlightIdx + 1) % filtered.length } : s);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setMentionState((s) => s ? { ...s, highlightIdx: (s.highlightIdx - 1 + filtered.length) % filtered.length } : s);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      insertMention(filtered[mentionState.highlightIdx]);
    } else if (e.key === 'Escape') {
      setMentionState(null);
      setDateRange(null);
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Add a comment... (type @ to mention a team member, // to insert a date)"
        maxLength={maxLength}
        rows={3}
        disabled={disabled}
        style={{
          width: '100%',
          resize: 'vertical',
          padding: '8px 10px',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          fontSize: '0.875rem',
          background: 'var(--bg-input)',
          color: 'var(--text-primary)',
          fontFamily: 'inherit',
        }}
      />

      {/* @mention dropdown */}
      {mentionState && filtered.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 100,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            listStyle: 'none',
            margin: 0,
            padding: '4px 0',
            maxHeight: '200px',
            overflowY: 'auto',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {filtered.map((m, i) => (
            <li
              key={m._id}
              onMouseDown={(e) => { e.preventDefault(); insertMention(m); }}
              style={{
                padding: '6px 12px',
                cursor: 'pointer',
                background: i === mentionState.highlightIdx ? 'var(--bg-hover, rgba(0,0,0,0.06))' : 'transparent',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <strong>{m.name}</strong>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{m.loginId}</span>
            </li>
          ))}
        </ul>
      )}

      {/* // date-picker trigger */}
      {dateRange && (
        <div style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="date"
            autoFocus
            style={{
              padding: '4px 8px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontSize: '0.875rem',
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
            }}
            onChange={(e) => { if (e.target.value) insertDate(e.target.value); }}
            onBlur={() => setDateRange(null)}
            onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); setDateRange(null); } }}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Pick a date to insert (Esc to cancel)
          </span>
        </div>
      )}
    </div>
  );
}
