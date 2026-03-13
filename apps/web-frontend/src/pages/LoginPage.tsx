import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage(): React.ReactElement {
  const { loginWithMicrosoft, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const redirected = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      navigate("/");
      return;
    }
    if (redirected.current) return;
    redirected.current = true;
    loginWithMicrosoft().catch((err: unknown) => {
      const e = err as Error & { errorCode?: string };
      if (e.errorCode !== "user_cancelled") {
        setError(e.message || "Microsoft sign-in failed");
      }
    });
  }, [authLoading, user, navigate, loginWithMicrosoft]);

  if (error) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1>Task Tracker</h1>
          <div className="error-banner">{error}</div>
          <button
            type="button"
            className="btn btn-secondary btn-full"
            onClick={() => {
              setError("");
              redirected.current = false;
            }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Task Tracker</h1>
        <p>Redirecting to Microsoft sign-in...</p>
      </div>
    </div>
  );
}
