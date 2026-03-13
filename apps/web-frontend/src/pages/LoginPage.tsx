import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage(): React.ReactElement {
  const { loginWithMicrosoft, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) navigate("/");
  }, [user, authLoading, navigate]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMicrosoftLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithMicrosoft();
    } catch (err: unknown) {
      const e = err as Error & { errorCode?: string };
      if (e.errorCode !== "user_cancelled") {
        setError(e.message || "Microsoft sign-in failed");
      }
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
        <button
          type="button"
          className="btn btn-secondary btn-full"
          onClick={handleMicrosoftLogin}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in with Microsoft"}
        </button>
      </div>
    </div>
  );
}
