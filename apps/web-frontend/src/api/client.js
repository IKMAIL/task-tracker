// Base fetch wrapper — injects auth header and handles 401 redirects
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const getToken = () => localStorage.getItem('token');

export const apiFetch = async (path, options = {}) => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return;
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error?.message || 'Request failed');
  return body;
};
