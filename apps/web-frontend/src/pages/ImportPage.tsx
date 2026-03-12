import React, { useState, useRef } from 'react';
import { useFetch } from '../hooks/useFetch';
import { listTeams } from '../api/teamApi';
import { importTeams, importMembers, importTeamMembers, importTasks } from '../api/importApi';
import ErrorBanner from '../components/common/ErrorBanner';
import Spinner from '../components/common/Spinner';

interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

interface Team {
  _id: string;
  name: string;
}

const TEMPLATES: Record<string, { filename: string; headers: string[]; example: string[] }> = {
  teams: {
    filename: 'teams_template.csv',
    headers: ['name', 'description'],
    example: ['Engineering', 'Engineering department'],
  },
  members: {
    filename: 'members_template.csv',
    headers: ['name', 'loginId', 'position', 'birthday', 'joiningDate'],
    example: ['Jane Doe', 'jdoe', 'Software Engineer', '1990-01-15', '2023-06-01'],
  },
  teamMembers: {
    filename: 'team_members_template.csv',
    headers: ['teamName', 'memberLoginId'],
    example: ['Engineering', 'jdoe'],
  },
  tasks: {
    filename: 'tasks_template.csv',
    headers: ['title', 'description', 'category', 'teamName', 'status', 'completionPct', 'plannedStartDate', 'dueDate', 'nextUpdateDate'],
    example: ['Implement login', 'Add login page', 'Automation Testing Coverage', 'Engineering', 'not_started', '0', '2025-01-01', '2025-03-01', '2025-02-01'],
  },
};

function downloadTemplate(key: string) {
  const template = TEMPLATES[key];
  const csvContent = [
    template.headers.join(','),
    template.example.join(','),
  ].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = template.filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface ImportSectionProps {
  title: string;
  description: string;
  templateKey: string;
  onImport: (file: File) => Promise<any>;
}

function ImportSection({ title, description, templateKey, onImport }: ImportSectionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await onImport(file);
      setResult(res.data);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="import-section">
      <div className="import-section-header">
        <h3>{title}</h3>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => downloadTemplate(templateKey)}
        >
          Download Template
        </button>
      </div>
      <p className="import-description">{description}</p>

      <div className="import-actions">
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => {
            setFile(e.target.files?.[0] || null);
            setResult(null);
            setError('');
          }}
        />
        <button
          type="button"
          className="btn btn-primary"
          disabled={!file || loading}
          onClick={handleImport}
        >
          {loading ? 'Importing...' : 'Import'}
        </button>
        {(result || error) && (
          <button type="button" className="btn btn-sm" onClick={handleReset}>
            Reset
          </button>
        )}
      </div>

      {loading && <Spinner />}
      <ErrorBanner message={error} />

      {result && (
        <div className="import-results">
          <div className="import-stats">
            <span className="import-stat import-stat-created">{result.created} created</span>
            <span className="import-stat import-stat-updated">{result.updated} updated</span>
            {result.skipped > 0 && (
              <span className="import-stat import-stat-skipped">{result.skipped} skipped</span>
            )}
            {result.errors.length > 0 && (
              <span className="import-stat import-stat-errors">{result.errors.length} errors</span>
            )}
          </div>

          {result.errors.length > 0 && (
            <table className="data-table import-error-table">
              <thead>
                <tr>
                  <th>Row</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                {result.errors.map((err, idx) => (
                  <tr key={idx}>
                    <td>{err.row}</td>
                    <td>{err.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default function ImportPage(): React.ReactElement {
  const { data: teamsData, loading: teamsLoading } = useFetch<Team[]>(listTeams);
  const teams: Team[] = teamsData || [];

  const handleTaskImport = async (file: File) => {
    const teamMap: Record<string, string> = {};
    for (const team of teams) {
      teamMap[team.name] = team._id;
    }
    return importTasks(file, teamMap);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Import Data</h1>
        <p>Upload CSV or Excel files to bulk import data. Download a template to see the expected format.</p>
      </div>

      <ImportSection
        title="Teams"
        description="Import teams with name and description. Teams are matched by name — existing teams will be updated."
        templateKey="teams"
        onImport={importTeams}
      />

      <ImportSection
        title="Members"
        description="Import members with name, loginId, position, birthday, and joining date. Members are matched by loginId — existing members will be updated."
        templateKey="members"
        onImport={importMembers}
      />

      <ImportSection
        title="Team-Member Associations"
        description="Associate members to teams. Requires teams and members to be imported first. Uses team name and member loginId to link."
        templateKey="teamMembers"
        onImport={importTeamMembers}
      />

      <ImportSection
        title="Tasks"
        description={
          teamsLoading
            ? 'Loading teams for mapping...'
            : `Import tasks with team assignments. Uses team name to resolve team ID. ${teams.length} teams available for mapping.`
        }
        templateKey="tasks"
        onImport={handleTaskImport}
      />
    </div>
  );
}
