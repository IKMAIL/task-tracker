const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const getToken = (): string | null => localStorage.getItem('token');

async function uploadFile(path: string, file: File, extraFields?: Record<string, string>): Promise<any> {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);
  if (extraFields) {
    for (const [key, value] of Object.entries(extraFields)) {
      formData.append(key, value);
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return;
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error?.message || 'Import failed');
  return body;
}

export const importTeams = (file: File): Promise<any> =>
  uploadFile('/import/teams', file);

export const importMembers = (file: File): Promise<any> =>
  uploadFile('/import/members', file);

export const importTeamMembers = (file: File): Promise<any> =>
  uploadFile('/import/team-members', file);

export const importTasks = (file: File, teamMap: Record<string, string>): Promise<any> =>
  uploadFile('/import/tasks', file, { teamMap: JSON.stringify(teamMap) });
