import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from './Header';

export default function PrivateRoute() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <>
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
    </>
  );
}
