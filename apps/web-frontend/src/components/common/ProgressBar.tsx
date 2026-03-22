import React from 'react';

interface ProgressBarProps {
  value: number;
  showLabel?: boolean;
}

export default function ProgressBar({ value = 0, showLabel = true }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));

  const gradient =
    pct >= 80
      ? 'linear-gradient(90deg, #16a34a, #84cc16)'
      : pct >= 50
      ? 'linear-gradient(90deg, #d97706, #f59e0b)'
      : 'linear-gradient(90deg, #b91c1c, #ef4444)';

  const labelColor =
    pct >= 80 ? '#84cc16' : pct >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div
        style={{
          flex: 1,
          background: 'var(--border, #2a2a2a)',
          borderRadius: '2px',
          height: '10px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            background: gradient,
            backgroundImage: [
              gradient,
              'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.1) 4px, rgba(255,255,255,0.1) 8px)',
            ].join(', '),
            height: '10px',
            borderRadius: '2px',
            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>
      {showLabel && (
        <span
          style={{
            fontSize: '0.78rem',
            minWidth: '38px',
            fontWeight: 700,
            color: labelColor,
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            letterSpacing: '0.02em',
          }}
        >
          {pct}%
        </span>
      )}
    </div>
  );
}
