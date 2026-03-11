import React, { useCallback, useEffect, useState } from "react";
import { useFetch } from "../hooks/useFetch";
import {
  listTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  listMembers,
  createMember,
  addMemberToTeam,
  removeMemberFromTeam,
} from "../api/teamApi";
import Spinner from "../components/common/Spinner";
import ErrorBanner from "../components/common/ErrorBanner";

interface Member {
  _id: string;
  name: string;
  loginId: string;
  position: string;
  birthday: string | null;
  joiningDate: string | null;
}

interface Team {
  _id: string;
  name: string;
  description: string;
  memberIds: Member[];
}

interface TeamForm {
  name: string;
  description: string;
}

interface MemberForm {
  name: string;
  loginId: string;
  position: string;
  birthday: string;
  joiningDate: string;
}

const emptyTeamForm: TeamForm = { name: "", description: "" };
const emptyMemberForm: MemberForm = {
  name: "",
  loginId: "",
  position: "",
  birthday: "",
  joiningDate: "",
};

function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString();
}

export default function TeamManagementPage(): React.ReactElement {
  const { data: teams, loading, error, refetch } = useFetch<Team[]>(listTeams);

  // Team form state
  const [form, setForm] = useState<TeamForm>(emptyTeamForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Member management state
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [showNewMemberForm, setShowNewMemberForm] = useState(false);
  const [memberForm, setMemberForm] = useState<MemberForm>(emptyMemberForm);
  const [memberSubmitting, setMemberSubmitting] = useState(false);

  // All members (for "Add Existing" dropdown)
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [selectedExistingMemberId, setSelectedExistingMemberId] = useState("");
  const [showAddExisting, setShowAddExisting] = useState(false);

  const fetchAllMembers = useCallback(async () => {
    try {
      const res = await listMembers();
      setAllMembers(res.data || []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchAllMembers();
  }, [fetchAllMembers]);

  const set = (key: keyof TeamForm, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const setMember = (key: keyof MemberForm, val: string) =>
    setMemberForm((f) => ({ ...f, [key]: val }));

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyTeamForm);
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
    setForm(emptyTeamForm);
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

  const toggleMembers = (teamId: string) => {
    if (expandedTeamId === teamId) {
      setExpandedTeamId(null);
      setShowNewMemberForm(false);
      setShowAddExisting(false);
    } else {
      setExpandedTeamId(teamId);
      setShowNewMemberForm(false);
      setShowAddExisting(false);
      fetchAllMembers();
    }
  };

  const handleAddNewMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expandedTeamId) return;
    setFormError("");
    setMemberSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        name: memberForm.name,
        loginId: memberForm.loginId,
        position: memberForm.position || "",
        birthday: memberForm.birthday || null,
        joiningDate: memberForm.joiningDate || null,
      };
      const res = await createMember(payload);
      const newMemberId = res.data._id;
      await addMemberToTeam(expandedTeamId, newMemberId);
      setMemberForm(emptyMemberForm);
      setShowNewMemberForm(false);
      refetch();
      fetchAllMembers();
    } catch (err: unknown) {
      setFormError((err as Error).message);
    } finally {
      setMemberSubmitting(false);
    }
  };

  const handleAddExistingMember = async () => {
    if (!expandedTeamId || !selectedExistingMemberId) return;
    setFormError("");
    setMemberSubmitting(true);
    try {
      await addMemberToTeam(expandedTeamId, selectedExistingMemberId);
      setSelectedExistingMemberId("");
      setShowAddExisting(false);
      refetch();
    } catch (err: unknown) {
      setFormError((err as Error).message);
    } finally {
      setMemberSubmitting(false);
    }
  };

  const handleRemoveMember = async (teamId: string, memberId: string, memberName: string) => {
    if (!window.confirm(`Remove "${memberName}" from this team?`)) return;
    setFormError("");
    try {
      await removeMemberFromTeam(teamId, memberId);
      refetch();
    } catch (err: unknown) {
      setFormError((err as Error).message);
    }
  };

  if (loading) return <Spinner />;

  const getAvailableMembers = (team: Team) => {
    const teamMemberIds = new Set((team.memberIds || []).map((m) => m._id));
    return allMembers.filter((m) => !teamMemberIds.has(m._id));
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Manage Teams</h1>
        {!showForm && (
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {(teams || []).map((team) => (
            <React.Fragment key={team._id}>
              <tr>
                <td>{team.name}</td>
                <td>{team.description || "—"}</td>
                <td>{team.memberIds?.length ?? 0}</td>
                <td>
                  <button
                    className="btn btn-sm"
                    onClick={() => toggleMembers(team._id)}
                    style={{ marginRight: "0.5rem" }}
                  >
                    {expandedTeamId === team._id ? "Hide Members" : "Members"}
                  </button>
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
              </tr>

              {expandedTeamId === team._id && (
                <tr>
                  <td colSpan={4} style={{ padding: "1rem", background: "var(--bg-secondary, #f9f9f9)" }}>
                    <div style={{ marginBottom: "0.75rem", display: "flex", gap: "0.5rem" }}>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          setShowNewMemberForm(true);
                          setShowAddExisting(false);
                          setMemberForm(emptyMemberForm);
                        }}
                      >
                        + Add New Member
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => {
                          setShowAddExisting(true);
                          setShowNewMemberForm(false);
                          setSelectedExistingMemberId("");
                        }}
                      >
                        + Add Existing Member
                      </button>
                    </div>

                    {showNewMemberForm && (
                      <form
                        className="form-card"
                        onSubmit={handleAddNewMember}
                        style={{ marginBottom: "1rem" }}
                      >
                        <h3>New Member</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                          <div className="form-group">
                            <label>Name *</label>
                            <input
                              value={memberForm.name}
                              onChange={(e) => setMember("name", e.target.value)}
                              required
                              maxLength={100}
                            />
                          </div>
                          <div className="form-group">
                            <label>Login ID *</label>
                            <input
                              value={memberForm.loginId}
                              onChange={(e) => setMember("loginId", e.target.value)}
                              required
                              maxLength={100}
                            />
                          </div>
                          <div className="form-group">
                            <label>Position</label>
                            <input
                              value={memberForm.position}
                              onChange={(e) => setMember("position", e.target.value)}
                              maxLength={100}
                            />
                          </div>
                          <div className="form-group">
                            <label>Birthday</label>
                            <input
                              type="date"
                              value={memberForm.birthday}
                              onChange={(e) => setMember("birthday", e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label>Joining Date</label>
                            <input
                              type="date"
                              value={memberForm.joiningDate}
                              onChange={(e) => setMember("joiningDate", e.target.value)}
                            />
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                          <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={memberSubmitting}
                          >
                            {memberSubmitting ? "Adding..." : "Add Member"}
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => setShowNewMemberForm(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {showAddExisting && (
                      <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <select
                          value={selectedExistingMemberId}
                          onChange={(e) => setSelectedExistingMemberId(e.target.value)}
                          style={{ padding: "0.4rem" }}
                        >
                          <option value="">Select a member...</option>
                          {getAvailableMembers(team).map((m) => (
                            <option key={m._id} value={m._id}>
                              {m.name} ({m.loginId})
                            </option>
                          ))}
                        </select>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={handleAddExistingMember}
                          disabled={!selectedExistingMemberId || memberSubmitting}
                        >
                          {memberSubmitting ? "Adding..." : "Add"}
                        </button>
                        <button
                          className="btn btn-sm"
                          onClick={() => setShowAddExisting(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {(team.memberIds || []).length > 0 ? (
                      <table className="data-table" style={{ marginBottom: 0 }}>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Login ID</th>
                            <th>Position</th>
                            <th>Birthday</th>
                            <th>Joining Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {team.memberIds.map((member) => (
                            <tr key={member._id}>
                              <td>{member.name}</td>
                              <td>{member.loginId}</td>
                              <td>{member.position || "—"}</td>
                              <td>{formatDate(member.birthday)}</td>
                              <td>{formatDate(member.joiningDate)}</td>
                              <td>
                                <button
                                  className="btn btn-sm"
                                  onClick={() =>
                                    handleRemoveMember(team._id, member._id, member.name)
                                  }
                                  style={{ color: "var(--danger)" }}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p style={{ color: "var(--text-secondary, #888)", fontStyle: "italic" }}>
                        No members in this team.
                      </p>
                    )}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
          {(teams || []).length === 0 && (
            <tr>
              <td colSpan={4} style={{ textAlign: "center" }}>
                No teams found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
