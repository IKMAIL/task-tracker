import React from 'react';
import Spinner from './Spinner';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

export default function LoadingButton({ loading, children, disabled, ...rest }: LoadingButtonProps) {
  return (
    <button {...rest} disabled={disabled || loading} aria-busy={loading}>
      {loading && <Spinner size={16} />}
      {children}
    </button>
  );
}
