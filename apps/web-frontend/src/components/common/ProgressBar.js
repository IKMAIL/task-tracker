import React from 'react';

export default function ProgressBar({ value = 0, showLabel = true }) {
  const pct = Math.min(100, Math.max(0, value));
  const color = pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, background: '#e5e7eb', borderRadius: '4px', height: '8px' }}>
        <div style={{ width: `${pct}%`, background: color, height: '8px', borderRadius: '4px', transition: 'width 0.3s' }} />
      </div>
      {showLabel && <span style={{ fontSize: '0.8rem', minWidth: '36px' }}>{pct}%</span>}
    </div>
  );
}
