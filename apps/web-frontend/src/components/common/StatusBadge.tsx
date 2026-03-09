import React from 'react';

const COLORS: Record<string, { bg: string; text: string }> = {
  not_started: { bg: '#6b7280', text: '#fff' },
  in_progress:  { bg: '#3b82f6', text: '#fff' },
  blocked:      { bg: '#ef4444', text: '#fff' },
  completed:    { bg: '#22c55e', text: '#fff' },
  cancelled:    { bg: '#9ca3af', text: '#fff' },
};

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = COLORS[status] || COLORS.not_started;
  return (
    <span style={{ backgroundColor: style.bg, color: style.text, padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-block' }}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}
