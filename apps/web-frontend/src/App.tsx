import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { NotificationProvider } from './context/NotificationContext';
import PrivateRoute from './components/common/PrivateRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TeamProgressPage from './pages/TeamProgressPage';
import TaskListPage from './pages/TaskListPage';
import TaskDetailPage from './pages/TaskDetailPage';
import TaskFormPage from './pages/TaskFormPage';
import AlertsPage from './pages/AlertsPage';
import UpdateProgressPage from './pages/UpdateProgressPage';
import TeamManagementPage from './pages/TeamManagementPage';
import ImportPage from './pages/ImportPage';
import ApiKeysPage from './pages/ApiKeysPage';
import AuditLogPage from './pages/AuditLogPage';
import KanbanBoard from './pages/KanbanBoard';
import AdminUsers from './pages/AdminUsers';
import './styles/global.css';

function App() {
  return (
    <ThemeProvider>
    <ToastProvider>
    <ConfirmProvider>
    <AuthProvider>
      <NotificationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<PrivateRoute />}>
            <Route path="/"                              element={<DashboardPage />} />
            <Route path="/teams"                         element={<TeamProgressPage />} />
            <Route path="/tasks"                         element={<TaskListPage />} />
            <Route path="/kanban"                        element={<KanbanBoard />} />
            <Route path="/tasks/new"                     element={<TaskFormPage />} />
            <Route path="/tasks/:id/edit"                element={<TaskFormPage />} />
            <Route path="/tasks/:id"                     element={<TaskDetailPage />} />
            <Route path="/teams/manage"                   element={<TeamManagementPage />} />
            <Route path="/alerts"                        element={<AlertsPage />} />
            <Route path="/progress/update/:taskId"       element={<UpdateProgressPage />} />
            <Route path="/import"                          element={<ImportPage />} />
            <Route path="/settings/api-keys"              element={<ApiKeysPage />} />
            <Route path="/audit"                           element={<AuditLogPage />} />
            <Route path="/admin/users"                     element={<AdminUsers />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
    </ConfirmProvider>
    </ToastProvider>
    </ThemeProvider>
  );
}
export default App;
