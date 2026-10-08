"use client";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Search,
  ShieldCheck,
  UserMinus,
  Users,
} from "lucide-react";
import { canManage, isAdmin } from "@/domain/permissions";
import { roles, type Project, type User } from "@/domain/types";
import { useWorkspace } from "./workspace-provider";
import {
  Alert,
  Avatar,
  Badge,
  downloadCsv,
  Empty,
  Heading,
  Modal,
  Panel,
  Stats,
} from "./ui";
import { UserForm } from "./workspace-forms";
export function TeamView() {
  const { data, user } = useWorkspace();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("All");
  const [active, setActive] = useState("active");
  const [page, setPage] = useState(1);
  const [edit, setEdit] = useState<User | "new" | null>(null);
  if (!data || !user) return null;
  const filtered = data.users.filter(
    (u) =>
      (u.name + " " + u.email + " " + u.title)
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (role === "All" || u.role === role) &&
      (active === "all" || u.active === (active === "active")),
  );
  const total = Math.max(1, Math.ceil(filtered.length / 8));
  const current = Math.min(page, total);
  return (
    <>
      <Heading
        eyebrow="UPSTREAM ASSETS / WORKSPACE ADMINISTRATION"
        title="Team & Access Management"
        description="Manage employee access, roles and project membership across the workspace."
        actions={
          <>
            <button
              className="button"
              onClick={() =>
                downloadCsv("workspace-team.csv", [
                  ["Name", "Email", "Role", "Active"],
                  ...filtered.map((u) => [
                    u.name,
                    u.email,
                    u.role,
                    u.active ? "Yes" : "No",
                  ]),
                ])
              }
            >
              <Download size={15} />
              Export Members
            </button>
            {isAdmin(user) && (
              <button className="button primary" onClick={() => setEdit("new")}>
                <Plus size={16} />
                Add Demo Member
              </button>
            )}
          </>
        }
      />
      <Alert success>
        <strong>
          {isAdmin(user) ? "Administrator access" : "Workspace directory"}
        </strong>{" "}
        ·{" "}
        {isAdmin(user)
          ? "Manage synthetic users and workspace roles. No invitations or emails are sent."
          : "Only Administrators can change workspace users and roles."}
      </Alert>
      <Stats
        items={[
          {
            label: "ACTIVE MEMBERS",
            value: data.users.filter((u) => u.active).length,
            detail: "Active workspace identities",
          },
          {
            label: "ADMINISTRATORS",
            value: data.users.filter(isAdmin).length,
            detail: "Last active Administrator protected",
            kind: "teal",
          },
          {
            label: "PROJECT MANAGERS",
            value: data.users.filter(
              (u) => u.active && u.role === "Project Manager",
            ).length,
            detail: "Assigned project leadership",
          },
          {
            label: "INACTIVE MEMBERS",
            value: data.users.filter((u) => !u.active).length,
            detail: "Cannot sign in or receive assignments",
          },
        ]}
      />
      <Panel>
        <div className="filter-row panel-body">
          <label className="search-field">
            <Search size={16} />
            <input
              aria-label="Search workspace members"
              placeholder="Search team, email, or job title…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </label>
          <select
            aria-label="Filter workspace role"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">All roles</option>
            {roles.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <select
            aria-label="Filter member activity"
            value={active}
            onChange={(e) => {
              setActive(e.target.value);
              setPage(1);
            }}
          >
            <option value="active">Active members</option>
            <option value="inactive">Inactive members</option>
            <option value="all">All members</option>
          </select>
        </div>
        {filtered.length ? (
          <>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Member & Identity</th>
                    <th>System Role</th>
                    <th>Job Title</th>
                    <th>Project Access</th>
                    <th>Status</th>
                    {isAdmin(user) && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice((current - 1) * 8, current * 8).map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="person">
                          <Avatar name={u.name} />
                          <span>
                            <strong>{u.name}</strong>
                            <small>{u.email}</small>
                          </span>
                        </div>
                      </td>
                      <td>
                        <Badge
                          kind={
                            u.role === "Administrator" ? "active" : "default"
                          }
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td>{u.title}</td>
                      <td>
                        {isAdmin(u)
                          ? "All workspace projects"
                          : `${data.projects.filter((p) => p.memberIds.includes(u.id)).length} projects`}
                      </td>
                      <td>
                        <Badge>{u.active ? "Active" : "Inactive"}</Badge>
                      </td>
                      {isAdmin(user) && (
                        <td>
                          <button
                            className="button small-button"
                            onClick={() => setEdit(u)}
                            aria-label={`Edit ${u.name}`}
                          >
                            Edit Member
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <span>{filtered.length} members</span>
              <div>
                <button
                  className="icon-button"
                  aria-label="Previous member page"
                  disabled={current === 1}
                  onClick={() => setPage(current - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                <span>
                  {current} / {total}
                </span>
                <button
                  className="icon-button"
                  aria-label="Next member page"
                  disabled={current === total}
                  onClick={() => setPage(current + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <Empty title="No matching members" />
        )}
      </Panel>
      <div className="three-grid">
        <Panel title="Role-Based Access Matrix">
          <div className="panel-body">
            <p className="muted">
              Administrators govern the workspace. Assigned managers coordinate
              their projects. Members update assigned work. Viewers have read
              access.
            </p>
          </div>
        </Panel>
        <Panel title="Project Membership">
          <div className="panel-body">
            <p className="muted">
              Access combines workspace role and project membership. Project
              managers have manager permissions only on their assigned projects.
            </p>
          </div>
        </Panel>
        <Panel title="Safe Member Offboarding">
          <div className="panel-body">
            <p className="muted">
              Open assignments must be explicitly unassigned before project
              removal. Replace current project managers before deactivation.
            </p>
          </div>
        </Panel>
      </div>
      {edit && isAdmin(user) && (
        <UserForm
          member={edit === "new" ? undefined : edit}
          onClose={() => setEdit(null)}
        />
      )}
    </>
  );
}
export function MembersView({ project: p }: { project: Project }) {
  const w = useWorkspace();
  const { data, user } = w;
  const [query, setQuery] = useState("");
  const [remove, setRemove] = useState<User | null>(null);
  const [unassign, setUnassign] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState("");
  if (!data || !user) return null;
  const members = data.users.filter((u) => p.memberIds.includes(u.id));
  const filtered = members.filter((u) =>
    (u.name + " " + u.email).toLowerCase().includes(query.toLowerCase()),
  );
  const allowed = canManage(user, p) && p.status !== "Archived";
  const available = data.users.filter(
    (u) => u.active && !p.memberIds.includes(u.id),
  );
  const assigned = remove
    ? data.tasks.filter(
        (t) => t.projectId === p.id && t.assigneeId === remove.id,
      )
    : [];
  return (
    <>
      <Stats
        items={[
          {
            label: "PROJECT PERSONNEL",
            value: members.filter((u) => u.active).length,
            detail: "Active project members",
          },
          {
            label: "OPEN ASSIGNMENTS",
            value: data.tasks.filter(
              (t) => t.projectId === p.id && t.status !== "Done",
            ).length,
            detail: "Current deliverable workload",
          },
          {
            label: "UNASSIGNED TASKS",
            value: data.tasks.filter(
              (t) => t.projectId === p.id && !t.assigneeId,
            ).length,
            detail: "Review assignment coverage",
            kind: "teal",
          },
          {
            label: "PROJECT MANAGER",
            value: 1,
            detail:
              data.users.find((u) => u.id === p.managerId)?.name ??
              "Unassigned",
          },
        ]}
      />
      <Panel
        title="Project Members"
        action={
          allowed && (
            <button
              className="button primary small-button"
              disabled={!available.length}
              onClick={() => {
                setSelected(available[0]?.id ?? "");
                setAdding(true);
              }}
            >
              <Plus size={15} />
              Add Member
            </button>
          )
        }
      >
        <div className="panel-body">
          <label className="search-field">
            <Search size={16} />
            <input
              aria-label="Search project members"
              placeholder="Search members, email, or identity…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
        {filtered.length ? (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Member & Identification</th>
                  <th>Workspace Role</th>
                  <th>Project Role</th>
                  <th>Open Work</th>
                  <th>Status</th>
                  {allowed && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="person">
                        <Avatar name={u.name} />
                        <span>
                          <strong>{u.name}</strong>
                          <small>{u.email}</small>
                        </span>
                      </div>
                    </td>
                    <td>{u.role}</td>
                    <td>
                      <Badge kind={p.managerId === u.id ? "active" : "default"}>
                        {p.managerId === u.id
                          ? "Project Manager"
                          : isAdmin(u)
                            ? "Administrator"
                            : u.role === "Viewer"
                              ? "Read Only"
                              : "Member"}
                      </Badge>
                    </td>
                    <td>
                      {
                        data.tasks.filter(
                          (t) =>
                            t.projectId === p.id &&
                            t.assigneeId === u.id &&
                            t.status !== "Done",
                        ).length
                      }{" "}
                      tasks
                    </td>
                    <td>
                      <Badge>{u.active ? "Active" : "Inactive"}</Badge>
                    </td>
                    {allowed && (
                      <td>
                        <button
                          className="text-button danger-text"
                          disabled={u.id === p.managerId || w.pending}
                          onClick={() => {
                            setRemove(u);
                            setUnassign(false);
                          }}
                          aria-label={`Remove ${u.name}`}
                        >
                          <UserMinus size={14} />
                          Remove
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="No matching project members" />
        )}
      </Panel>
      <div className="info-callout">
        <ShieldCheck size={23} />
        <p>
          Project membership & assignment integrity
          <small>
            Only active members can receive tasks. The assigned project manager
            cannot be removed until an Administrator selects a replacement.
          </small>
        </p>
      </div>
      {adding && (
        <Modal title="Add Project Member" onClose={() => setAdding(false)}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (
                await w.execute({
                  kind: "member.add",
                  projectId: p.id,
                  userId: selected,
                  expectedVersion: p.version,
                })
              )
                setAdding(false);
            }}
          >
            <div className="modal-body">
              <label className="field">
                Active workspace member
                <select
                  required
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                >
                  {available.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} · {u.role}
                    </option>
                  ))}
                </select>
              </label>
              <p className="muted">
                The member will gain project access according to their workspace
                role.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="button"
                onClick={() => setAdding(false)}
              >
                Cancel
              </button>
              <button
                className="button primary"
                disabled={w.pending || !selected}
              >
                <Users size={15} />
                Add Member
              </button>
            </div>
          </form>
        </Modal>
      )}
      {remove && (
        <Modal
          title="Remove Member & Review Assignments"
          onClose={() => setRemove(null)}
        >
          <div className="modal-body">
            <Alert>
              Removing {remove.name} revokes their project membership and clears
              all of their task assignments in this project.
            </Alert>
            <h3>Assigned work ({assigned.length})</h3>
            <ul className="assignment-list">
              {assigned.map((t) => (
                <li key={t.id}>
                  <strong>{t.title}</strong>
                  <Badge>{t.status}</Badge>
                </li>
              ))}
            </ul>
            {!assigned.length && <p>No task assignments to clear.</p>}
            <label className="check-field">
              <input
                type="checkbox"
                checked={unassign}
                onChange={(e) => setUnassign(e.target.checked)}
              />
              I explicitly confirm that these tasks should become unassigned.
            </label>
            <p className="muted">
              Assign a replacement from the task view if continuity is needed
              before removing this member.
            </p>
          </div>
          <div className="modal-footer">
            <button className="button" onClick={() => setRemove(null)}>
              Cancel
            </button>
            <button
              className="button danger"
              disabled={w.pending || (assigned.length > 0 && !unassign)}
              onClick={async () => {
                if (
                  await w.execute({
                    kind: "member.remove",
                    projectId: p.id,
                    userId: remove.id,
                    expectedVersion: p.version,
                    unassign,
                  })
                )
                  setRemove(null);
              }}
            >
              Remove Member
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
