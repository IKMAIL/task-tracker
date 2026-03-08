import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-brand">
        <Link to="/">Task Tracker</Link>
      </div>
      <nav className="header-nav">
        <Link to="/">Dashboard</Link>
        <Link to="/teams">Teams</Link>
        <Link to="/tasks">Tasks</Link>
        <Link to="/alerts">Alerts</Link>
      </nav>
      <div className="header-user">
        <span>{user?.name}</span>
        <button onClick={handleLogout} className="btn btn-sm">Logout</button>
      </div>
    </header>
  );
}
