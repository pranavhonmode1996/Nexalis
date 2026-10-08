"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowDownWideNarrow,
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  GripVertical,
  MessageSquare,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { canComment, canCreateTask, canEditTask } from "@/domain/permissions";
import { calendarDate, dubaiToday, timestamp } from "@/domain/dates";
import { priorities, statuses, type Project, type Task } from "@/domain/types";
import { useWorkspace } from "./workspace-provider";
import {
  Avatar,
  Badge,
  downloadCsv,
  Empty,
  Heading,
  Panel,
  State,
  useUnsavedChanges,
} from "./ui";
import { TaskForm } from "./workspace-forms";
export function TaskTable({
  tasks,
  showProject = false,
}: {
  tasks: Task[];
  showProject?: boolean;
}) {
  const { data, user, execute, pending } = useWorkspace();
  if (!data || !user) return null;
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Task / Deliverable</th>
            {showProject && <th>Project</th>}
            <th>Status</th>
            <th>Priority</th>
            <th>Assignee</th>
            <th>Due date</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => {
            const p = data.projects.find((p) => p.id === t.projectId)!;
            const assignee = data.users.find((u) => u.id === t.assigneeId);
            return (
              <tr key={t.id}>
                <td>
                  <Link
                    className="task-title"
                    href={`/projects/${p.id}/tasks/${t.id}`}
                  >
                    <small>
                      {p.key}-
                      {t.id.replace("task-", "").slice(0, 6).toUpperCase()}
                    </small>
                    <strong>{t.title}</strong>
                  </Link>
                </td>
                {showProject && (
                  <td>
                    <Link href={`/projects/${p.id}`}>{p.name}</Link>
                  </td>
                )}
                <td>
                  {canEditTask(user, p, t) ? (
                    <select
                      aria-label={`Status for ${t.title}`}
                      className={`status-select status-${t.status.toLowerCase().replaceAll(" ", "-")}`}
                      value={t.status}
                      disabled={pending}
                      onChange={(e) =>
                        execute({
                          kind: "task.status",
                          id: t.id,
                          expectedVersion: t.version,
                          status: e.target.value as Task["status"],
                        })
                      }
                    >
                      {statuses.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <Badge>{t.status}</Badge>
                  )}
                </td>
                <td>
                  <Badge>{t.priority}</Badge>
                </td>
                <td>
                  <span className="person">
                    {assignee && <Avatar name={assignee.name} small />}
                    {assignee?.name ?? "Unassigned"}
                  </span>
                </td>
                <td
                  className={
                    t.status !== "Done" && t.dueDate && t.dueDate < dubaiToday()
                      ? "overdue"
                      : ""
                  }
                >
                  {calendarDate(t.dueDate)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
export function TaskCollection({
  tasks,
  project,
  board = false,
  mine = false,
}: {
  tasks: Task[];
  project?: Project;
  board?: boolean;
  mine?: boolean;
}) {
  const { data, user, execute, pending, notify } = useWorkspace();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [assignee, setAssignee] = useState("All");
  const [sort, setSort] = useState("due");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Task["status"] | null>(null);
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  if (!data || !user) return null;
  const filtered = tasks
    .filter(
      (t) =>
        (t.title + " " + data.projects.find((p) => p.id === t.projectId)?.key)
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (status === "All" || t.status === status) &&
        (priority === "All" || t.priority === priority) &&
        (assignee === "All" || t.assigneeId === assignee) &&
        (!onlyOverdue ||
          (t.status !== "Done" && !!t.dueDate && t.dueDate < dubaiToday())),
    )
    .sort((a, b) =>
      sort === "title"
        ? a.title.localeCompare(b.title)
        : sort === "priority"
          ? priorities.indexOf(b.priority) - priorities.indexOf(a.priority)
          : (a.dueDate || "9999").localeCompare(b.dueDate || "9999"),
    );
  const totalPages = Math.max(1, Math.ceil(filtered.length / 8));
  const currentPage = Math.min(page, totalPages);
  const selectable = data.users.filter(
    (u) => u.active && tasks.some((t) => t.assigneeId === u.id),
  );
  const csv = () =>
    downloadCsv(mine ? "my-tasks.csv" : "project-tasks.csv", [
      ["Project", "Task", "Status", "Priority", "Assignee", "Due date"],
      ...filtered.map((t) => [
        data.projects.find((p) => p.id === t.projectId)?.name ?? "",
        t.title,
        t.status,
        t.priority,
        data.users.find((u) => u.id === t.assigneeId)?.name ?? "Unassigned",
        t.dueDate,
      ]),
    ]);
  return (
    <>
      <div className="task-controls panel">
        <div className="filter-row">
          <label className="search-field">
            <Search size={16} />
            <input
              aria-label="Search tasks"
              placeholder="Search tasks, tags, or project key…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </label>
          <select
            aria-label="Filter task status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">All statuses</option>
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            aria-label="Filter task priority"
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">All priorities</option>
            {priorities.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            aria-label="Filter task assignee"
            value={assignee}
            onChange={(e) => {
              setAssignee(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">All assignees</option>
            <option value="">Unassigned</option>
            {selectable.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <label className="sort-control">
            <ArrowDownWideNarrow size={15} />
            <select
              aria-label="Sort tasks"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
            >
              <option value="due">Due date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
          </label>
          <button
            className="icon-button"
            aria-label="Export filtered tasks CSV"
            onClick={csv}
          >
            <Download size={17} />
          </button>
        </div>
        <div className="quick-filters">
          <SlidersHorizontal size={14} />
          <span>QUICK FILTERS</span>
          <button
            className={`filter-chip ${assignee === user.id ? "selected" : ""}`}
            onClick={() => {
              setAssignee(assignee === user.id ? "All" : user.id);
              setPage(1);
            }}
          >
            Only my tasks
          </button>
          <button
            className={`filter-chip ${onlyOverdue ? "selected" : ""}`}
            onClick={() => {
              setOnlyOverdue(!onlyOverdue);
              setPage(1);
            }}
          >
            Overdue
          </button>
          <button
            className="filter-chip"
            onClick={() => {
              setQuery("");
              setStatus("All");
              setPriority("All");
              setAssignee("All");
              setOnlyOverdue(false);
              setPage(1);
            }}
          >
            Reset filters
          </button>
          <small>{filtered.length} tasks</small>
        </div>
      </div>
      {!filtered.length ? (
        <Panel>
          <Empty
            title={tasks.length ? "No matching tasks" : "No tasks yet"}
            body={
              tasks.length
                ? "Clear or adjust your filters to see more work."
                : "Create the first task to start coordinating this project."
            }
          />
        </Panel>
      ) : board && project ? (
        <>
          <p className="board-hint">
            Drag eligible tasks between columns, or use the status selector on
            each card.
          </p>
          <div className="board" aria-label="Project task board">
            {statuses.map((s) => (
              <section
                className={`board-column column-${s.toLowerCase().replaceAll(" ", "-")}`}
                key={s}
                aria-label={s}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={async (e) => {
                  e.preventDefault();
                  try {
                    const payload = JSON.parse(
                      e.dataTransfer.getData("application/nexalis-task"),
                    ) as { id: string; version: number };
                    const task = tasks.find((t) => t.id === payload.id);
                    if (task && canEditTask(user, project, task))
                      await execute({
                        kind: "task.status",
                        id: task.id,
                        expectedVersion: payload.version,
                        status: s,
                      });
                  } catch {
                    notify(
                      "Unable to move this card. Use its status selector.",
                    );
                  }
                }}
              >
                <div className="column-heading">
                  <h2>
                    <i />
                    {s}
                  </h2>
                  <span>{filtered.filter((t) => t.status === s).length}</span>
                  {canCreateTask(user, project) && (
                    <button
                      className="icon-button"
                      aria-label={`Create task in ${s}`}
                      onClick={() => setEditing(s)}
                    >
                      <Plus size={15} />
                    </button>
                  )}
                </div>
                <div className="column-cards">
                  {filtered
                    .filter((t) => t.status === s)
                    .map((t) => (
                      <TaskCard key={t.id} task={t} project={project} />
                    ))}
                  {!filtered.some((t) => t.status === s) && (
                    <div className="column-empty">No tasks in this stage</div>
                  )}
                </div>
              </section>
            ))}
          </div>
        </>
      ) : (
        <Panel>
          <TaskTable
            tasks={filtered.slice((currentPage - 1) * 8, currentPage * 8)}
            showProject={!project}
          />
          <div className="pagination">
            <span>
              Showing {(currentPage - 1) * 8 + 1}–
              {Math.min(currentPage * 8, filtered.length)} of {filtered.length}{" "}
              tasks
            </span>
            <div>
              <button
                className="icon-button"
                aria-label="Previous page"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
              >
                <ChevronLeft size={17} />
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="icon-button"
                aria-label="Next page"
                disabled={currentPage === totalPages}
                onClick={() => setPage(currentPage + 1)}
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </Panel>
      )}
      {editing && project && (
        <TaskForm
          project={project}
          initialStatus={editing}
          onClose={() => setEditing(null)}
        />
      )}
      {pending && (
        <span className="sr-only" role="status">
          Saving task changes
        </span>
      )}
    </>
  );
}
function TaskCard({ task: t, project: p }: { task: Task; project: Project }) {
  const { data, user, execute, pending } = useWorkspace();
  const assignee = data!.users.find((u) => u.id === t.assigneeId);
  const editable = canEditTask(user, p, t);
  return (
    <article
      className="task-card"
      draggable={editable && !pending}
      onDragStart={(e) => {
        e.dataTransfer.setData(
          "application/nexalis-task",
          JSON.stringify({ id: t.id, version: t.version }),
        );
        e.dataTransfer.effectAllowed = "move";
      }}
    >
      <div className="task-card-top">
        <span>
          {p.key}-{t.id.replace("task-", "").slice(0, 6).toUpperCase()}
        </span>
        <Badge>{t.priority}</Badge>
        {editable && <GripVertical size={13} aria-hidden="true" />}
      </div>
      <Link
        href={`/projects/${p.id}/tasks/${t.id}`}
        className="card-title"
        draggable={false}
      >
        {t.title}
      </Link>
      <div className="task-tag">ENGINEERING REVIEW</div>
      <div className="task-card-meta">
        <span>
          <CalendarDays size={13} />
          {calendarDate(t.dueDate)}
        </span>
        {assignee ? (
          <Avatar name={assignee.name} small />
        ) : (
          <span>Unassigned</span>
        )}
      </div>
      {editable && (
        <select
          aria-label={`Status for ${t.title}`}
          className="card-status"
          value={t.status}
          disabled={pending}
          onChange={(e) =>
            execute({
              kind: "task.status",
              id: t.id,
              expectedVersion: t.version,
              status: e.target.value as Task["status"],
            })
          }
        >
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      )}
    </article>
  );
}
export function TaskDetail({
  project,
  taskId,
}: {
  project: Project;
  taskId: string;
}) {
  const w = useWorkspace();
  const { data, user } = w;
  const [editing, setEditing] = useState(false);
  const [comment, setComment] = useState("");
  useUnsavedChanges(!!comment);
  if (!data || !user) return null;
  const t = data.tasks.find(
    (t) => t.id === taskId && t.projectId === project.id,
  );
  if (!t)
    return (
      <State
        title="Task not found"
        body="This task is unavailable or does not belong to this project."
        code="404"
      />
    );
  const assignee = data.users.find((u) => u.id === t.assigneeId);
  const comments = data.comments.filter((c) => c.taskId === t.id);
  const activities = data.activities.filter((a) => a.taskId === t.id);
  const allowed = canEditTask(user, project, t);
  return (
    <>
      <Link href={`/projects/${project.id}/tasks`} className="back-link">
        <ArrowLeft size={15} />
        Back to project tasks
      </Link>
      <Heading
        eyebrow={`${project.key} / ${t.id.toUpperCase()} · ENGINEERING DELIVERABLE`}
        title={t.title}
        actions={
          allowed && (
            <button className="button primary" onClick={() => setEditing(true)}>
              <Pencil size={15} />
              Edit Task
            </button>
          )
        }
      />
      <div className="status-strip">
        <Badge>{t.status}</Badge>
        <Badge>{t.priority}</Badge>
        <span>
          <CalendarDays size={14} />
          {calendarDate(t.dueDate)}
        </span>
        <span>Revision {t.version}</span>
      </div>
      <div className="detail-grid">
        <div className="stack">
          <Panel title="Engineering Scope & Acceptance Criteria">
            <div className="panel-body">
              <p className="preserve-lines">{t.description}</p>
              <div className="info-callout">
                <ShieldIcon />
                <p>
                  Document review workflow
                  <small>
                    Use the task status and comments to coordinate verification
                    with active project members.
                  </small>
                </p>
              </div>
            </div>
          </Panel>
          <Panel title={`Comments & Notes (${comments.length})`}>
            <div className="panel-body">
              {canComment(user, project) ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (
                      await w.execute({
                        kind: "comment.add",
                        taskId: t.id,
                        body: comment,
                      })
                    )
                      setComment("");
                  }}
                >
                  <label className="field">
                    Add a comment
                    <textarea
                      maxLength={3000}
                      required
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add engineering notes, mention review findings, or request follow-up…"
                    />
                  </label>
                  <div className="form-actions">
                    <small>
                      Comments are saved locally with author and GST timestamp.
                    </small>
                    <button
                      className="button primary"
                      disabled={w.pending || !comment.trim()}
                    >
                      <MessageSquare size={15} />
                      Post Comment
                    </button>
                  </div>
                </form>
              ) : (
                <p className="muted">
                  {project.status === "Archived"
                    ? "Archived project · Comments are read-only."
                    : "Viewer access · Comments are read-only."}
                </p>
              )}
              <div className="comments">
                {comments.map((c) => {
                  const author = data.users.find((u) => u.id === c.authorId);
                  return (
                    <article className="comment" key={c.id}>
                      <Avatar name={author?.name ?? "Former member"} small />
                      <div>
                        <div className="comment-heading">
                          <strong>{author?.name ?? "Former member"}</strong>
                          <time dateTime={c.createdAt}>
                            {timestamp(c.createdAt)}
                          </time>
                        </div>
                        <p className="preserve-lines">{c.body}</p>
                      </div>
                    </article>
                  );
                })}
                {!comments.length && <p className="muted">No comments yet.</p>}
              </div>
            </div>
          </Panel>
          <Panel title="Audit Trail & Activity">
            <div className="panel-body activity-list">
              {activities.map((a) => (
                <div key={a.id}>
                  <Avatar
                    name={
                      data.users.find((u) => u.id === a.authorId)?.name ??
                      "Member"
                    }
                    small
                  />
                  <p>
                    <strong>
                      {data.users.find((u) => u.id === a.authorId)?.name}
                    </strong>{" "}
                    {a.body}
                    <small>{timestamp(a.createdAt)}</small>
                  </p>
                </div>
              ))}
              {!activities.length && (
                <p className="muted">No recorded activity for this task yet.</p>
              )}
            </div>
          </Panel>
        </div>
        <aside className="stack">
          <Panel title="Deliverable Details">
            <dl className="detail-list">
              <div>
                <dt>Project</dt>
                <dd>
                  <Link href={`/projects/${project.id}`}>{project.name}</Link>
                </dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  {allowed ? (
                    <select
                      aria-label="Task status"
                      value={t.status}
                      disabled={w.pending}
                      onChange={(e) =>
                        w.execute({
                          kind: "task.status",
                          id: t.id,
                          expectedVersion: t.version,
                          status: e.target.value as Task["status"],
                        })
                      }
                    >
                      {statuses.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <Badge>{t.status}</Badge>
                  )}
                </dd>
              </div>
              <div>
                <dt>Priority</dt>
                <dd>
                  <Badge>{t.priority}</Badge>
                </dd>
              </div>
              <div>
                <dt>Assignee</dt>
                <dd className="person">
                  {assignee && <Avatar name={assignee.name} small />}
                  {assignee?.name ?? "Unassigned"}
                </dd>
              </div>
              <div>
                <dt>Due date</dt>
                <dd>{calendarDate(t.dueDate)}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{timestamp(t.createdAt)}</dd>
              </div>
              <div>
                <dt>Updated</dt>
                <dd>{timestamp(t.updatedAt)}</dd>
              </div>
            </dl>
          </Panel>
          <Panel title="Asset & Project Context">
            <div className="panel-body">
              <h3>{project.location}</h3>
              <p className="muted">{project.description}</p>
              <Link
                className="text-link"
                href={`/projects/${project.id}/members`}
              >
                View project members →
              </Link>
            </div>
          </Panel>
        </aside>
      </div>
      {editing && allowed && (
        <TaskForm
          project={project}
          task={t}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}
function ShieldIcon() {
  return <SlidersHorizontal size={21} />;
}
