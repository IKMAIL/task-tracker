import React from 'react';

export default function Spinner({ size = 32 }: { size?: number }) {
  return (
    <div className="spinner" role="status" aria-label="Loading">
      <svg className="spinner-svg" width={size} height={size} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
        <path d="M16 4 a12 12 0 0 1 12 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}
