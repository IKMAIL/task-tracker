import React from 'react';

interface StatusColors {
  dot: string;
  bg: string;
  text: string;
  border: string;
}

const COLORS: Record<string, StatusColors> = {
  not_started: {
    dot: '#6b7280',
    bg: 'rgba(107, 114, 128, 0.12)',
    text: '#9ca3af',
    border: 'rgba(107, 114, 128, 0.20)',
  },
  in_progress: {
    dot: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.12)',
    text: '#38bdf8',
    border: 'rgba(56, 189, 248, 0.20)',
  },
  blocked: {
    dot: '#f87171',
    bg: 'rgba(248, 113, 113, 0.12)',
    text: '#f87171',
    border: 'rgba(248, 113, 113, 0.20)',
  },
  completed: {
    dot: '#4ade80',
    bg: 'rgba(74, 222, 128, 0.12)',
    text: '#4ade80',
    border: 'rgba(74, 222, 128, 0.20)',
  },
  cancelled: {
    dot: '#6b7280',
    bg: 'rgba(107, 114, 128, 0.08)',
    text: '#6b7280',
    border: 'rgba(107, 114, 128, 0.15)',
  },
};

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = COLORS[status] || COLORS.not_started;
  return (
    <span
      style={{
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        padding: '3px 10px 3px 7px',
        borderRadius: '4px',
        fontSize: '0.72rem',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: style.dot,
          flexShrink: 0,
        }}
      />
      {status?.replace(/_/g, ' ')}
    </span>
  );
}
