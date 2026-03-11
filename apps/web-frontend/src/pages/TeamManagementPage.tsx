import React, { useState } from "react";
import { useFetch } from "../hooks/useFetch";
import { listTeams, createTeam, updateTeam, deleteTeam } from "../api/teamApi";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/common/Spinner";
import ErrorBanner from "../components/common/ErrorBanner";

interface Team {
  _id: string;
  name: string;
  description: string;
  memberIds: string[];
}

interface TeamForm {
  name: string;
  description: string;
}

const emptyForm: TeamForm = { name: "", description: "" };

export default function TeamManagementPage(): React.ReactElement {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { data: teams, loading, error, refetch } = useFetch<Team[]>(listTeams);

  const [form, setForm] = useState<TeamForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const set = (key: keyof TeamForm, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (team: Team) => {
    setEditingId(team._id);
    setForm({ name: team.name, description: team.description });
    setFormError("");
    setShowForm(true);
  };

  const cancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      if (editingId) {
        await updateTeam(editingId, form as unknown as Record<string, unknown>);
      } else {
        await createTeam(form as unknown as Record<string, unknown>);
      }
      cancel();
      refetch();
    } catch (err: unknown) {
      setFormError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (team: Team) => {
    if (!window.confirm(`Delete team "${team.name}"? This cannot be undone.`))
      return;
    try {
      await deleteTeam(team._id);
      refetch();
    } catch (err: unknown) {
      setFormError((err as Error).message);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Manage Teams</h1>
        {isAdmin && !showForm && (
          <button className="btn btn-primary" onClick={openCreate}>
            + New Team
          </button>
        )}
      </div>

      <ErrorBanner message={error} />
      <ErrorBanner message={formError} />

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit Team" : "New Team"}</h2>
          <div className="form-group">
            <label>Name *</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
              minLength={2}
              maxLength={100}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              maxLength={500}
            />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting
                ? "Saving..."
                : editingId
                  ? "Update Team"
                  : "Create Team"}
            </button>
            <button type="button" className="btn btn-sm" onClick={cancel}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Members</th>
            {isAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {(teams || []).map((team) => (
            <tr key={team._id}>
              <td>{team.name}</td>
              <td>{team.description || "—"}</td>
              <td>{team.memberIds?.length ?? 0}</td>
              {isAdmin && (
                <td>
                  <button
                    className="btn btn-sm"
                    onClick={() => openEdit(team)}
                    style={{ marginRight: "0.5rem" }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm"
                    onClick={() => handleDelete(team)}
                    style={{ color: "var(--danger)" }}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
          {(teams || []).length === 0 && (
            <tr>
              <td colSpan={isAdmin ? 4 : 3} style={{ textAlign: "center" }}>
                No teams found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
