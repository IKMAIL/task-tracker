import React from 'react';

interface EmptyStateProps {
  title: string;
  body?: string;
  icon?: React.ReactNode;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ title, body, icon, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <div className="empty-state-title">{title}</div>
      {body && <div className="empty-state-body">{body}</div>}
      {action && (
        <button className="btn btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
