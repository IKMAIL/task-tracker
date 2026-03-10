import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { listTeams } from '../api/teamApi';
import { getByTeam } from '../api/taskApi';
import Spinner from '../components/common/Spinner';
import ErrorBanner from '../components/common/ErrorBanner';
import StatusBadge from '../components/common/StatusBadge';
import ProgressBar from '../components/common/ProgressBar';

interface Team { _id: string; name: string; }
interface Task { _id: string; title: string; category: string; status: string; completionPct: number; dueDate?: string; }

export default function TeamProgressPage(): React.ReactElement {
  const { data: teams, loading, error } = useFetch<Team[]>(listTeams);
  const [selectedTeamId, setSelectedTeamId] = useState('');

  const { data: tasks, loading: tasksLoading, error: tasksError } = useFetch<Task[]>(
    () => selectedTeamId ? getByTeam(selectedTeamId) : Promise.resolve({ data: [] }),
    [selectedTeamId]
  );

  if (loading) return <Spinner />;

  const teamTasks = tasks || [];
  const completed = teamTasks.filter((t) => t.status === 'completed').length;
  const teamPct = teamTasks.length > 0 ? Math.round((completed / teamTasks.length) * 100) : 0;

  return (
    <div className="page">
      <h1>Team Progress</h1>
      <ErrorBanner message={error} />
      <div className="form-group" style={{ maxWidth: '320px' }}>
        <label>Select Team</label>
        <select value={selectedTeamId} onChange={(e) => setSelectedTeamId(e.target.value)}>
          <option value="">Choose a team...</option>
          {(teams || []).map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
        </select>
      </div>
      {selectedTeamId && (
        <>
          {tasksLoading ? <Spinner /> : (
            <>
              <div className="summary-bar">
                <span>{teamTasks.length} tasks</span>
                <span>{completed} completed</span>
                <ProgressBar value={teamPct} />
              </div>
              <ErrorBanner message={tasksError} />
              <table className="data-table">
                <thead>
                  <tr><th>Title</th><th>Category</th><th>Status</th><th>Progress</th><th>Due Date</th></tr>
                </thead>
                <tbody>
                  {teamTasks.map((task) => (
                    <tr key={task._id}>
                      <td><Link to={`/tasks/${task._id}`}>{task.title}</Link></td>
                      <td>{task.category}</td>
                      <td><StatusBadge status={task.status} /></td>
                      <td style={{ width: '150px' }}><ProgressBar value={task.completionPct} /></td>
                      <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                  {teamTasks.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: 'center' }}>No tasks for this team.</td></tr>
                  )}
                </tbody>
              </table>
            </>
          )}
        </>
      )}
    </div>
  );
}
