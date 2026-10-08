"use client";
import { useState } from "react";
import { Check, Save, ShieldCheck } from "lucide-react";
import {
  assignableMembers,
  canAccess,
  canCreateTask,
  canManage,
  isAdmin,
} from "@/domain/permissions";
import {
  priorities,
  roles,
  statuses,
  type Project,
  type ProjectInput,
  type Task,
  type TaskInput,
  type User,
} from "@/domain/types";
import { useWorkspace } from "./workspace-provider";
import { Alert, Avatar, Modal } from "./ui";
export function ProjectForm({
  project,
  onClose,
}: {
  project?: Project;
  onClose: () => void;
}) {
  const { data, user, execute, pending, error: serviceError } = useWorkspace();
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [expectedVersion] = useState(project?.version);
  const [input, setInput] = useState<ProjectInput>(() =>
    project
      ? { ...project }
      : {
          name: "",
          key: "",
          description: "",
          location: "",
          managerId:
            data?.users.find((u) => u.role === "Project Manager" && u.active)
              ?.id ?? user!.id,
          memberIds: [user!.id],
          status: "Active",
          dueDate: "",
        },
  );
  if (!data || !user) return null;
  const admin = isAdmin(user);
  const managers = data.users.filter(
    (u) => u.active && (u.role === "Project Manager" || isAdmin(u)),
  );
  const set = <K extends keyof ProjectInput>(k: K, v: ProjectInput[K]) => {
    setInput((i) => ({ ...i, [k]: v }));
    setDirty(true);
  };
  return (
    <Modal
      title={project ? "Edit Project" : "Create New Project"}
      onClose={onClose}
      dirty={dirty}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          const memberIds = Array.from(
            new Set([...input.memberIds, input.managerId]),
          );
          if (
            await execute({
              kind: "project.save",
              id: project?.id,
              expectedVersion,
              input: { ...input, memberIds },
            })
          ) {
            setDirty(false);
            onClose();
          } else
            setError(
              "Project was not saved. Review the message above the page and retry.",
            );
        }}
      >
        <div className="modal-body">
          <Alert success>
            {admin
              ? "Administrator access · Create projects and assign accountable managers."
              : "Assigned project manager · Update project information."}
          </Alert>
          <h3 className="section-label">01 / PROJECT IDENTITY & SCOPE</h3>
          <label className="field">
            Project name <span>*</span>
            <input
              required
              maxLength={180}
              value={input.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Offshore Pipeline Maintenance"
            />
          </label>
          <div className="form-grid">
            <label className="field">
              Project key <span>*</span>
              <input
                required
                pattern="[A-Z][A-Z0-9]{1,7}"
                maxLength={8}
                value={input.key}
                onChange={(e) => set("key", e.target.value.toUpperCase())}
                placeholder="e.g. OPM"
              />
            </label>
            <label className="field">
              Target completion
              <input
                type="date"
                value={input.dueDate}
                onChange={(e) => set("dueDate", e.target.value)}
              />
            </label>
          </div>
          <label className="field">
            Concession / location
            <input
              maxLength={180}
              value={input.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="Asset or operating location"
            />
          </label>
          <label className="field">
            Engineering scope & objectives <span>*</span>
            <textarea
              required
              rows={4}
              maxLength={5000}
              value={input.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe the project scope and expected outcomes…"
            />
          </label>
          <h3 className="section-label">02 / GOVERNANCE & PERSONNEL</h3>
          <div className="form-grid">
            <label className="field">
              Lead project manager
              <select
                disabled={!admin}
                value={input.managerId}
                onChange={(e) => set("managerId", e.target.value)}
              >
                {managers.map((u) => (
                  <option value={u.id} key={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Project status
              <select
                disabled={!admin}
                value={input.status}
                onChange={(e) =>
                  set("status", e.target.value as ProjectInput["status"])
                }
              >
                {["Active", "On Hold", "Archived"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
          {!project && (
            <>
              <p className="field-label">Initial team allocation</p>
              <div className="member-picker">
                {data.users
                  .filter((u) => u.active)
                  .map((u) => (
                    <label key={u.id}>
                      <input
                        type="checkbox"
                        checked={
                          input.memberIds.includes(u.id) ||
                          input.managerId === u.id
                        }
                        disabled={input.managerId === u.id}
                        onChange={(e) =>
                          set(
                            "memberIds",
                            e.target.checked
                              ? [...input.memberIds, u.id]
                              : input.memberIds.filter((id) => id !== u.id),
                          )
                        }
                      />
                      <Avatar name={u.name} small />
                      <span>
                        {u.name}
                        <small>{u.role}</small>
                      </span>
                    </label>
                  ))}
              </div>
            </>
          )}
          {project && (
            <p className="muted">
              Use the Members tab to add or remove project members.
            </p>
          )}
          {error && <Alert>{serviceError || error}</Alert>}
        </div>
        <div className="modal-footer">
          <small>
            <ShieldCheck size={14} />
            Saved only in this browser demo
          </small>
          <button
            type="button"
            className="button"
            onClick={() => {
              if (!dirty || confirm("Discard your unsaved changes?")) onClose();
            }}
          >
            Cancel
          </button>
          <button disabled={pending} className="button primary">
            <Save size={15} />
            {pending ? "Saving…" : project ? "Save Project" : "Create Project"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
export function TaskForm({
  project,
  task,
  onClose,
  initialStatus = "To Do",
}: {
  project: Project;
  task?: Task;
  onClose: () => void;
  initialStatus?: TaskInput["status"];
}) {
  const { data, user, execute, pending, error: serviceError } = useWorkspace();
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [expectedVersion] = useState(task?.version);
  const [input, setInput] = useState<TaskInput>(() =>
    task
      ? { ...task }
      : {
          projectId: project.id,
          title: "",
          description: "",
          status: initialStatus,
          priority: "Medium",
          assigneeId: "",
          dueDate: "",
        },
  );
  if (!data || !user) return null;
  const p = data.projects.find((p) => p.id === input.projectId)!;
  const managed = canManage(user, p);
  const choices = assignableMembers(user, p, data.users);
  const set = <K extends keyof TaskInput>(k: K, v: TaskInput[K]) => {
    setInput((i) => ({ ...i, [k]: v }));
    setDirty(true);
  };
  return (
    <Modal
      title={task ? "Edit Task" : "Create Task"}
      onClose={onClose}
      dirty={dirty}
      drawer
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          if (
            await execute({
              kind: "task.save",
              id: task?.id,
              expectedVersion,
              input,
            })
          ) {
            setDirty(false);
            onClose();
          } else
            setError(
              "Task was not saved. Check the page error, then retry or close and reopen for the latest version.",
            );
        }}
      >
        <div className="modal-body">
          <div className="form-context">
            <span className="badge badge-active">TASK COMPOSER</span>
            <span>
              {p.key} · {p.name}
            </span>
          </div>
          <h3 className="section-label">01 / CORE DETAILS</h3>
          <label className="field">
            Project
            <select
              value={input.projectId}
              disabled={!!task}
              onChange={(e) => {
                setInput((i) => ({
                  ...i,
                  projectId: e.target.value,
                  assigneeId: "",
                }));
                setDirty(true);
              }}
            >
              {data.projects
                .filter((p) => canAccess(user, p) && canCreateTask(user, p))
                .map((p) => (
                  <option value={p.id} key={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </label>
          <label className="field">
            Task title <span>*</span>
            <input
              required
              maxLength={240}
              autoFocus
              value={input.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="What needs to be delivered?"
            />
          </label>
          <div className="form-grid">
            <label className="field">
              Priority
              <select
                value={input.priority}
                onChange={(e) =>
                  set("priority", e.target.value as TaskInput["priority"])
                }
              >
                {priorities.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Status
              <select
                value={input.status}
                onChange={(e) =>
                  set("status", e.target.value as TaskInput["status"])
                }
              >
                {statuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
          <h3 className="section-label">02 / ASSIGNMENT & SCHEDULE</h3>
          <label className="field">
            Assignee
            <select
              disabled={!!task && !managed}
              value={input.assigneeId}
              onChange={(e) => set("assigneeId", e.target.value)}
            >
              <option value="">Unassigned</option>
              {choices.map((u) => (
                <option value={u.id} key={u.id}>
                  {u.name}
                </option>
              ))}
              {task &&
                !managed &&
                task.assigneeId &&
                !choices.some((u) => u.id === task.assigneeId) && (
                  <option value={task.assigneeId}>
                    {data.users.find((u) => u.id === task.assigneeId)?.name}
                  </option>
                )}
            </select>
            <small>
              {managed
                ? "Only active project members are available."
                : task
                  ? "Reassignment requires your project manager."
                  : "Members may assign to themselves or leave unassigned."}
            </small>
          </label>
          <label className="field">
            Due date
            <input
              type="date"
              value={input.dueDate}
              onChange={(e) => set("dueDate", e.target.value)}
            />
            <small>Calendar date · No timezone conversion</small>
          </label>
          <h3 className="section-label">
            03 / SPECIFICATIONS & ACCEPTANCE CRITERIA
          </h3>
          <label className="field">
            Description <span>*</span>
            <textarea
              required
              rows={7}
              maxLength={5000}
              value={input.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Include scope, engineering requirements and acceptance criteria…"
            />
          </label>
          {error && <Alert>{serviceError || error}</Alert>}
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="button"
            onClick={() => {
              if (!dirty || confirm("Discard your unsaved changes?")) onClose();
            }}
          >
            Cancel
          </button>
          <button disabled={pending} className="button primary">
            <Check size={15} />
            {pending ? "Saving…" : task ? "Save Changes" : "Create Task"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
export function UserForm({
  member,
  onClose,
}: {
  member?: User;
  onClose: () => void;
}) {
  const [expectedVersion] = useState(member?.version);
  const { execute, pending, error: serviceError } = useWorkspace();
  const [input, setInput] = useState<Omit<User, "id" | "version">>(() =>
    member
      ? { ...member }
      : { name: "", email: "", title: "", role: "Team Member", active: true },
  );
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  return (
    <Modal
      title={member ? "Edit Workspace Member" : "Add Demo Member"}
      onClose={onClose}
      dirty={dirty}
    >
      <form
        onChange={() => setDirty(true)}
        onSubmit={async (e) => {
          e.preventDefault();
          if (
            await execute({
              kind: "user.save",
              id: member?.id,
              expectedVersion,
              input,
            })
          ) {
            setDirty(false);
            onClose();
          } else
            setError(
              "Member was not saved. Review the page error before retrying.",
            );
        }}
      >
        <div className="modal-body">
          <Alert success>
            Local demo only. Adding a member creates a synthetic record; no
            invitation or email is sent.
          </Alert>
          <label className="field">
            Full name
            <input
              required
              maxLength={120}
              value={input.name}
              onChange={(e) => setInput({ ...input, name: e.target.value })}
            />
          </label>
          <label className="field">
            Email
            <input
              type="email"
              required
              maxLength={240}
              value={input.email}
              onChange={(e) => setInput({ ...input, email: e.target.value })}
            />
          </label>
          <label className="field">
            Job title
            <input
              value={input.title}
              maxLength={180}
              onChange={(e) => setInput({ ...input, title: e.target.value })}
            />
          </label>
          <label className="field">
            Workspace role
            <select
              value={input.role}
              onChange={(e) =>
                setInput({ ...input, role: e.target.value as User["role"] })
              }
            >
              {roles.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          <label className="check-field">
            <input
              type="checkbox"
              checked={input.active}
              onChange={(e) => setInput({ ...input, active: e.target.checked })}
            />
            Active workspace member
          </label>
          <p className="muted">
            Deactivation explicitly unassigns this member’s tasks. Current
            project managers must be replaced first. The last active
            Administrator is protected.
          </p>
          {error && <Alert>{serviceError || error}</Alert>}
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="button"
            onClick={() => {
              if (!dirty || confirm("Discard your unsaved changes?")) onClose();
            }}
          >
            Cancel
          </button>
          <button className="button primary" disabled={pending}>
            {pending ? "Saving…" : "Save Member"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
