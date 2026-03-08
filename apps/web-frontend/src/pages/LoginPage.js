import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, loginWithMicrosoft } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [msLoading, setMsLoading] = useState(false);

  const handleMicrosoftLogin = async () => {
    setError('');
    setMsLoading(true);
    try {
      await loginWithMicrosoft();
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setMsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Task Tracker</h1>
        <p>Engineering Backlog Monitor</p>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="divider">or</div>
        <button type="button" className="btn btn-secondary btn-full" onClick={handleMicrosoftLogin} disabled={msLoading}>
          {msLoading ? 'Signing in...' : 'Sign in with Microsoft'}
        </button>
      </div>
    </div>
  );
}
