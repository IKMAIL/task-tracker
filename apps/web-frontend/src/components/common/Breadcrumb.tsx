import React from 'react';
import { Link } from 'react-router-dom';

interface Crumb {
  label: string;
  to?: string;
}

export default function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {crumbs.map((crumb, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="breadcrumb-sep" aria-hidden="true">›</span>}
          {crumb.to && i < crumbs.length - 1
            ? <Link to={crumb.to}>{crumb.label}</Link>
            : <span aria-current={i === crumbs.length - 1 ? 'page' : undefined}>{crumb.label}</span>
          }
        </React.Fragment>
      ))}
    </nav>
  );
}
