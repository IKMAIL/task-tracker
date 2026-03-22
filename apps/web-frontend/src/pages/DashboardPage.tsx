import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import { getSummary } from "../api/taskApi";
import { listAlerts } from "../api/alertApi";
import { listTeams } from "../api/teamApi";
import Spinner from "../components/common/Spinner";
import ErrorBanner from "../components/common/ErrorBanner";
import ProgressBar from "../components/common/ProgressBar";
import EmptyState from "../components/common/EmptyState";
import { useAuth } from "../context/AuthContext";

interface SummaryItem {
  _id: { status: string; category: string };
  count: number;
}
interface Alert {
  _id: string;
  type: string;
  severity: string;
  message: string;
  isActive: boolean;
  createdAt: string;
}
interface Team {
  _id: string;
  name: string;
  memberIds?: string[];
}

// ── SVG icon helpers ──────────────────────────────────────────────────────────

function IconList() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconGrid() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function IconUpload() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}

// ── Completion ring ───────────────────────────────────────────────────────────

function CompletionRing({ pct }: { pct: number }) {
  const r = 45;
  const circumference = 2 * Math.PI * r; // ≈ 283
  const filled = (pct / 100) * circumference;
  const ringColor = pct >= 80 ? "#84cc16" : pct >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "20px",
        marginBottom: "16px",
      }}
    >
      <svg
        width="110"
        height="110"
        viewBox="0 0 110 110"
        style={{ flexShrink: 0 }}
      >
        {/* Track */}
        <circle
          cx="55"
          cy="55"
          r={r}
          fill="none"
          stroke="var(--border, #2a2a2a)"
          strokeWidth="8"
        />
        {/* Filled arc — rotated so it starts at 12 o'clock */}
        <circle
          cx="55"
          cy="55"
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          transform="rotate(-90 55 55)"
          style={{
            transition: "stroke-dasharray 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
        {/* Center label */}
        <text
          x="55"
          y="51"
          textAnchor="middle"
          fill={ringColor}
          fontSize="18"
          fontWeight="700"
          fontFamily='"JetBrains Mono", "Fira Code", monospace'
        >
          {pct}%
        </text>
        <text
          x="55"
          y="67"
          textAnchor="middle"
          fill="var(--text-muted, #6b7280)"
          fontSize="9"
          fontFamily='"JetBrains Mono", "Fira Code", monospace'
          letterSpacing="0.05em"
        >
          COMPLETE
        </text>
      </svg>
      <div style={{ flex: 1 }}>
        <ProgressBar value={pct} />
      </div>
    </div>
  );
}

// ── Formatted date ────────────────────────────────────────────────────────────

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// ── Section wrapper with left-border accent ───────────────────────────────────

const sectionStyle: React.CSSProperties = {
  borderLeft: "3px solid var(--accent, #38bdf8)",
  paddingLeft: "14px",
  marginBottom: "0",
};

// ── Main component ────────────────────────────────────────────────────────────

export default function DashboardPage(): React.ReactElement {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    data: summary,
    loading: l1,
    error: e1,
  } = useFetch<SummaryItem[]>(getSummary);
  const {
    data: alerts,
    loading: l2,
    error: e2,
  } = useFetch<Alert[]>(listAlerts);
  const { data: teams, loading: l3, error: e3 } = useFetch<Team[]>(listTeams);

  if (l1 || l2 || l3) return <Spinner />;

  const statusCounts: Record<string, number> = {};
  (summary || []).forEach(({ _id, count }) => {
    statusCounts[_id.status] = (statusCounts[_id.status] || 0) + count;
  });
  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const completed = statusCounts.completed || 0;
  const overallPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const activeAlerts = (alerts || []).filter((a) => a.isActive);

  return (
    <div className="page">
      {/* ── Welcome banner ── */}
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(56,189,248,0.08) 0%, rgba(132,204,22,0.06) 100%)",
          border: "1px solid rgba(56,189,248,0.18)",
          borderLeft: "4px solid #38bdf8",
          borderRadius: "6px",
          padding: "18px 24px",
          marginBottom: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "1.35rem",
              fontWeight: 700,
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
              color: "var(--text-muted, #e2e8f0)",
              letterSpacing: "-0.01em",
            }}
          >
            {getGreeting()},{" "}
            <span style={{ color: "#38bdf8" }}>{user?.name || "Team"}</span>
          </div>
          <div
            style={{
              fontSize: "0.78rem",
              color: "var(--text-muted, #6b7280)",
              marginTop: "4px",
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {formatDate()}
          </div>
        </div>
        <div
          style={{
            fontSize: "0.72rem",
            color: "var(--text-muted, #6b7280)",
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            padding: "4px 10px",
            border: "1px solid rgba(56,189,248,0.2)",
            borderRadius: "3px",
          }}
        >
          Operations Center
        </div>
      </div>

      {(e1 || e2 || e3) && <ErrorBanner message={e1 || e2 || e3} />}

      {/* ── Stat cards ── */}
      <div className="stats-grid">
        <div
          className="stat-card"
          style={{ position: "relative", overflow: "hidden" }}
        >
          <div
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              opacity: 0.25,
              color: "var(--text, #e2e8f0)",
            }}
          >
            <IconList />
          </div>
          <div className="stat-value">{total}</div>
          <div className="stat-label">Total Tasks</div>
          <div
            style={{
              fontSize: "0.7rem",
              color: "#84cc16",
              marginTop: "4px",
              fontWeight: 600,
            }}
          >
            ▲ all tracked
          </div>
        </div>

        <div
          className="stat-card"
          style={{ position: "relative", overflow: "hidden" }}
        >
          <div
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              opacity: 0.25,
              color: "var(--text, #e2e8f0)",
            }}
          >
            <IconCheck />
          </div>
          <div className="stat-value">{completed}</div>
          <div className="stat-label">Completed</div>
          <div
            style={{
              fontSize: "0.7rem",
              color: "#84cc16",
              marginTop: "4px",
              fontWeight: 600,
            }}
          >
            ▲ {overallPct}% overall
          </div>
        </div>

        <div
          className="stat-card"
          style={{ position: "relative", overflow: "hidden" }}
        >
          <div
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              opacity: 0.25,
              color: "var(--text, #e2e8f0)",
            }}
          >
            <IconClock />
          </div>
          <div className="stat-value">{statusCounts.in_progress || 0}</div>
          <div className="stat-label">In Progress</div>
          <div
            style={{
              fontSize: "0.7rem",
              color: "#f59e0b",
              marginTop: "4px",
              fontWeight: 600,
            }}
          >
            ▲ active work
          </div>
        </div>

        <div
          className="stat-card stat-card--alert"
          style={{ position: "relative", overflow: "hidden" }}
        >
          <div
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              opacity: 0.25,
              color: "var(--text, #e2e8f0)",
            }}
          >
            <IconBell />
          </div>
          <div className="stat-value">{activeAlerts.length}</div>
          <div className="stat-label">Active Alerts</div>
          {activeAlerts.length > 0 ? (
            <Link to="/alerts" className="stat-link">
              View →
            </Link>
          ) : (
            <div
              style={{
                fontSize: "0.7rem",
                color: "#84cc16",
                marginTop: "4px",
                fontWeight: 600,
              }}
            >
              ▲ all clear
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-grid-left">
          <section style={sectionStyle}>
            <h2>Overall Completion</h2>
            <CompletionRing pct={overallPct} />
          </section>

          <section style={sectionStyle}>
            <h2>Teams</h2>
            <div className="teams-grid">
              {(teams || []).map((team) => (
                <div key={team._id} className="team-card">
                  <h3>{team.name}</h3>
                  <p>{team.memberIds?.length || 0} members</p>
                  <Link to={`/teams?teamId=${team._id}`} className="btn btn-sm">
                    View Tasks
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="dashboard-grid-right">
          <section style={sectionStyle}>
            <h2>Quick Actions</h2>
            <div className="quick-actions">
              <button
                className="quick-action-btn"
                onClick={() => navigate("/tasks/new")}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <IconPlus />
                <span>New Task</span>
              </button>
              <button
                className="quick-action-btn"
                onClick={() => navigate("/kanban")}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <IconGrid />
                <span>Kanban</span>
              </button>
              <button
                className="quick-action-btn"
                onClick={() => navigate("/alerts")}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <IconBell />
                <span>Alerts</span>
              </button>
              <button
                className="quick-action-btn"
                onClick={() => navigate("/import")}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <IconUpload />
                <span>Import</span>
              </button>
            </div>
          </section>

          <section style={sectionStyle}>
            <h2>Recent Alerts</h2>
            {activeAlerts.length === 0 ? (
              <EmptyState
                title="No active alerts"
                body="All tasks are on track."
              />
            ) : (
              activeAlerts.slice(0, 5).map((alert) => (
                <div
                  key={alert._id}
                  className={`alert-item alert-item--${alert.severity}`}
                >
                  <strong>{alert.type.replace(/_/g, " ")}</strong> —{" "}
                  {alert.message}
                </div>
              ))
            )}
            {activeAlerts.length > 5 && (
              <Link to="/alerts">View all {activeAlerts.length} alerts →</Link>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
