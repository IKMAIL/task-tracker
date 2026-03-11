import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface MergeState {
  idToken: string;
  email: string;
}

export default function LoginPage(): React.ReactElement {
  const {
    login,
    loginWithMicrosoft,
    mergeAccounts,
    pendingMerge,
    clearPendingMerge,
    user,
    loading: authLoading,
  } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("authLoading:", authLoading, "user:", user);

    if (!authLoading && user) navigate("/");
  }, [user, authLoading, navigate]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mergeState, setMergeState] = useState<MergeState | null>(null);
  const [mergePassword, setMergePassword] = useState("");
  const [mergeError, setMergeError] = useState("");
  const [mergeLoading, setMergeLoading] = useState(false);

  useEffect(() => {
    if (pendingMerge) {
      setMergeState({
        idToken: pendingMerge.idToken,
        email: pendingMerge.email,
      });
    }
  }, [pendingMerge]);

  const handleMicrosoftLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithMicrosoft();
    } catch (err: unknown) {
      const e = err as Error & {
        mergeRequired?: boolean;
        idToken?: string;
        email?: string;
        errorCode?: string;
      };
      if (e.mergeRequired) {
        setMergeState({ idToken: e.idToken!, email: e.email! });
      } else if (e.errorCode !== "user_cancelled") {
        setError(e.message || "Microsoft sign-in failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMergeConfirm = async () => {
    if (!mergeState) return;
    setMergeError("");
    setMergeLoading(true);
    try {
      await mergeAccounts(mergeState.idToken, mergePassword);
      clearPendingMerge();
      navigate("/");
    } catch (err: unknown) {
      setMergeError((err as Error).message || "Failed to merge accounts");
    } finally {
      setMergeLoading(false);
    }
  };

  const handleMergeCancel = () => {
    setMergeState(null);
    setMergePassword("");
    setMergeError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: unknown) {
      setError((err as Error).message);
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
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="divider">or</div>
        <button
          type="button"
          className="btn btn-secondary btn-full"
          onClick={handleMicrosoftLogin}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in with Microsoft"}
        </button>
      </div>

      {mergeState && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Merge Accounts</h2>
            <p>
              An account with <strong>{mergeState.email}</strong> already
              exists. Enter your password to link your Microsoft account.
            </p>
            {mergeError && <div className="error-banner">{mergeError}</div>}
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={mergePassword}
                onChange={(e) => setMergePassword(e.target.value)}
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={handleMergeConfirm}
                disabled={mergeLoading || !mergePassword}
              >
                {mergeLoading ? "Linking..." : "Link Accounts"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleMergeCancel}
                disabled={mergeLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
