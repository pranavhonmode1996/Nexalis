"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Archive,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  LayoutGrid,
  List,
  Pencil,
  Plus,
  Search,
  Users,
} from "lucide-react";
import {
  canAccess,
  canCreateTask,
  canManage,
  isAdmin,
} from "@/domain/permissions";
import { calendarDate, dubaiToday, timestamp } from "@/domain/dates";
import type { Project } from "@/domain/types";
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
  Progress,
  State,
  Stats,
} from "./ui";
import { ProjectForm, TaskForm } from "./workspace-forms";
import { TaskCollection, TaskDetail, TaskTable } from "./task-views";
import { MembersView } from "./team-views";
export function ProjectCard({ project: p }: { project: Project }) {
  const { data } = useWorkspace();
  if (!data) return null;
  const tasks = data.tasks.filter((t) => t.projectId === p.id);
  const done = tasks.filter((t) => t.status === "Done").length;
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const critical = tasks.filter(
    (t) => t.priority === "Critical" && t.status !== "Done",
  ).length;
  const members = data.users.filter(
    (u) => p.memberIds.includes(u.id) && u.active,
  );
  return (
    <article className="project-card">
      <div className="project-card-heading">
        <span className="project-key">{p.key}</span>
        <div>
          <Link href={`/projects/${p.id}`}>
            <h2>{p.name}</h2>
          </Link>
          <small>{p.location}</small>
        </div>
        <Badge>{p.status}</Badge>
      </div>
      <p>{p.description}</p>
      <div className="project-manager">
        <Avatar
          name={
            data.users.find((u) => u.id === p.managerId)?.name ?? "Unassigned"
          }
          small
        />
        <span>
          {data.users.find((u) => u.id === p.managerId)?.name}
          <small>Lead Project Manager</small>
        </span>
        <span className="project-due">
          <CalendarDays size={13} />
          {calendarDate(p.dueDate)}
        </span>
      </div>
      <div className={`project-callout ${critical ? "critical" : ""}`}>
        <span>
          {critical ? "CRITICAL ATTENTION" : "NEXT DELIVERY MILESTONE"}
        </span>
        <strong>
          {critical
            ? `${critical} critical task${critical === 1 ? "" : "s"} require attention`
            : "Engineering document review & verification"}
        </strong>
      </div>
      <div className="project-progress">
        <span>
          {done} of {tasks.length} tasks completed
        </span>
        <strong>{progress}%</strong>
      </div>
      <Progress value={progress} />
      <div className="project-card-footer">
        <div className="avatar-stack">
          {members.slice(0, 4).map((m) => (
            <Avatar key={m.id} name={m.name} small />
          ))}
        </div>
        <Link href={`/projects/${p.id}/board`}>
          Open Board <ArrowUpRight size={13} />
        </Link>
        <Link href={`/projects/${p.id}/tasks`}>
          Open List <ArrowUpRight size={13} />
        </Link>
      </div>
    </article>
  );
}
export function ProjectsView() {
  const { data, user } = useWorkspace();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [manager, setManager] = useState("All");
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);
  const [create, setCreate] = useState(false);
  if (!data || !user) return null;
  const accessible = data.projects.filter((p) => canAccess(user, p));
  const filtered = accessible.filter(
    (p) =>
      (p.name + " " + p.key + " " + p.location)
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (status === "All" ||
        (status === "Mine" && p.memberIds.includes(user.id)) ||
        p.status === status) &&
      (manager === "All" || p.managerId === manager),
  );
  const tasks = data.tasks.filter((t) =>
    accessible.some((p) => p.id === t.projectId),
  );
  const done = tasks.filter((t) => t.status === "Done").length;
  const totalPages = Math.max(1, Math.ceil(filtered.length / 6));
  const currentPage = Math.min(page, totalPages);
  return (
    <>
      <Heading
        eyebrow="UPSTREAM ASSETS / PROJECTS DIRECTORY"
        title="Projects Portfolio & Workstreams"
        description="Active, holding and archived operational initiatives across UAE concessions, offshore rigs and logistics terminals."
        actions={
          isAdmin(user) && (
            <button className="button primary" onClick={() => setCreate(true)}>
              <Plus size={16} />
              Create Project
            </button>
          )
        }
      />
      <div className="filter-row panel project-filters">
        <label className="search-field">
          <Search size={16} />
          <input
            aria-label="Search projects"
            placeholder="Search project name, key, or location…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <div className="segmented">
          {["All", "Active", "Archived", "Mine"].map((s) => (
            <button
              key={s}
              className={status === s ? "selected" : ""}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
            >
              {s === "All" ? `All Projects (${accessible.length})` : s}
            </button>
          ))}
        </div>
        <select
          aria-label="Filter project manager"
          value={manager}
          onChange={(e) => {
            setManager(e.target.value);
            setPage(1);
          }}
        >
          <option value="All">All managers</option>
          {data.users
            .filter((u) => accessible.some((p) => p.managerId === u.id))
            .map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
        </select>
        <div className="segmented">
          <button
            aria-label="Grid view"
            aria-pressed={view === "grid"}
            className={view === "grid" ? "selected" : ""}
            onClick={() => setView("grid")}
          >
            <LayoutGrid size={17} />
          </button>
          <button
            aria-label="List view"
            aria-pressed={view === "list"}
            className={view === "list" ? "selected" : ""}
            onClick={() => setView("list")}
          >
            <List size={17} />
          </button>
        </div>
      </div>
      <Stats
        items={[
          {
            label: "TOTAL PORTFOLIO",
            value: `${accessible.length} Initiatives`,
            detail: "Accessible workspace projects",
          },
          {
            label: "SCHEDULE COMPLETION",
            value: `${tasks.length ? Math.round((done / tasks.length) * 100) : 0}%`,
            detail: "Completed across the portfolio",
            kind: "teal",
          },
          {
            label: "OPEN DELIVERABLES",
            value: `${tasks.length - done} Tasks`,
            detail: "Pending operational work",
          },
          {
            label: "CRITICAL OPEN ITEMS",
            value: tasks.filter(
              (t) => t.priority === "Critical" && t.status !== "Done",
            ).length,
            detail: "Require priority attention",
            kind: "red",
          },
        ]}
      />
      {!filtered.length ? (
        <Panel>
          <Empty
            title="No projects found"
            body="Adjust your filters or ask your administrator for project access."
          />
        </Panel>
      ) : view === "grid" ? (
        <div className="projects-grid">
          {filtered.slice((currentPage - 1) * 6, currentPage * 6).map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <Panel>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Due date</th>
                  <th>Members</th>
                </tr>
              </thead>
              <tbody>
                {filtered
                  .slice((currentPage - 1) * 6, currentPage * 6)
                  .map((p) => (
                    <tr key={p.id}>
                      <td>
                        <Link className="task-title" href={`/projects/${p.id}`}>
                          <small>{p.key}</small>
                          <strong>{p.name}</strong>
                        </Link>
                      </td>
                      <td>{p.location}</td>
                      <td>
                        <Badge>{p.status}</Badge>
                      </td>
                      <td>{calendarDate(p.dueDate)}</td>
                      <td>{p.memberIds.length}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
      <div className="pagination">
        <span>{filtered.length} projects</span>
        <div>
          <button
            className="icon-button"
            aria-label="Previous project page"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          <span>
            {currentPage} / {totalPages}
          </span>
          <button
            className="icon-button"
            aria-label="Next project page"
            disabled={currentPage === totalPages}
            onClick={() => setPage(currentPage + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      {create && <ProjectForm onClose={() => setCreate(false)} />}
    </>
  );
}
export function ProjectView({
  projectId,
  section = "overview",
  taskId,
}: {
  projectId: string;
  section?: string;
  taskId?: string;
}) {
  const w = useWorkspace();
  const { data, user } = w;
  const [edit, setEdit] = useState(false);
  const [task, setTask] = useState(false);
  const [archive, setArchive] = useState(false);
  if (!data || !user) return null;
  const p = data.projects.find((p) => p.id === projectId);
  if (!p)
    return (
      <State
        title="Project not found"
        body="This project does not exist or the link is incomplete."
        code="404"
      />
    );
  if (!canAccess(user, p))
    return (
      <State
        title="Access Restricted — Project Workspace"
        body="Your workspace role and project membership do not grant access to this project. Contact your workspace Administrator for access."
      />
    );
  if (taskId)
    return (
      <>
        {p.status === "Archived" && (
          <Alert>Archived project · All task records are read-only.</Alert>
        )}
        <TaskDetail project={p} taskId={taskId} />
      </>
    );
  const tasks = data.tasks.filter((t) => t.projectId === p.id);
  const done = tasks.filter((t) => t.status === "Done").length;
  const percent = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const activities = data.activities
    .filter((a) => a.projectId === p.id)
    .slice(0, 8);
  const members = data.users.filter(
    (u) => p.memberIds.includes(u.id) && u.active,
  );
  const title =
    section === "board"
      ? `${p.key} Sprint & Kanban Board`
      : section === "tasks"
        ? `${p.key} Deliverables & Task List`
        : p.name;
  return (
    <>
      <Heading
        eyebrow={`UPSTREAM ASSETS / ${p.location.toUpperCase()} / ${p.key}`}
        title={title}
        description={
          section === "overview"
            ? p.description
            : `Engineering deliverables and project coordination for ${p.name}.`
        }
        actions={
          <>
            {canManage(user, p) && (
              <button className="button" onClick={() => setEdit(true)}>
                <Pencil size={15} />
                Edit Project
              </button>
            )}
            {canCreateTask(user, p) && (
              <button className="button primary" onClick={() => setTask(true)}>
                <Plus size={15} />
                Create Task
              </button>
            )}
            <button
              className="button"
              aria-label="Export project summary CSV"
              onClick={() =>
                downloadCsv(`${p.key}-summary.csv`, [
                  [
                    "Project",
                    "Key",
                    "Status",
                    "Tasks",
                    "Completed",
                    "Completion",
                  ],
                  [p.name, p.key, p.status, tasks.length, done, percent + "%"],
                ])
              }
            >
              <Download size={15} />
              <span>Export Summary</span>
            </button>
          </>
        }
      />
      <div className="project-meta">
        <Badge>{p.status}</Badge>
        <span>
          <CalendarDays size={14} />
          {calendarDate(p.dueDate)}
        </span>
        <span>
          <Users size={14} />
          {members.length} active members
        </span>
        {isAdmin(user) && p.status !== "Archived" && (
          <button
            className="text-button danger-text"
            onClick={() => setArchive(true)}
          >
            <Archive size={14} />
            Archive Project
          </button>
        )}
      </div>
      <nav className="project-tabs" aria-label="Project views">
        {[
          ["overview", "Overview", ""],
          ["board", "Board", "/board"],
          ["tasks", "Task List", "/tasks"],
          ["members", "Members", "/members"],
        ].map(([key, label, url]) => (
          <Link
            href={`/projects/${p.id}${url}`}
            key={key}
            className={section === key ? "active" : ""}
            aria-current={section === key ? "page" : undefined}
          >
            {label}
            {key === "tasks" && <span>{tasks.length}</span>}
            {key === "members" && <span>{members.length}</span>}
          </Link>
        ))}
      </nav>
      {p.status === "Archived" && (
        <Alert>
          Archived project · Historical records remain readable. Task creation,
          edits, comments and membership changes are disabled.
        </Alert>
      )}
      {section === "board" || section === "tasks" ? (
        <TaskCollection
          key={`${p.id}-${section}`}
          project={p}
          tasks={tasks}
          board={section === "board"}
        />
      ) : section === "members" ? (
        <MembersView project={p} />
      ) : (
        <>
          <Stats
            items={[
              {
                label: "OVERALL PROGRESS",
                value: `${percent}%`,
                detail: `${done} of ${tasks.length} tasks completed`,
                kind: "teal",
              },
              {
                label: "CRITICAL / ACTIVE ITEMS",
                value: tasks.filter(
                  (t) => t.priority === "Critical" && t.status !== "Done",
                ).length,
                detail: "Priority deliverables to review",
                kind: "red",
              },
              {
                label: "OPEN DELIVERABLES",
                value: tasks.length - done,
                detail: "Across current project stages",
              },
              {
                label: "MILESTONE DAYS",
                value: p.dueDate
                  ? Math.ceil(
                      (Date.parse(p.dueDate) - Date.parse(dubaiToday())) /
                        86400000,
                    )
                  : "—",
                detail: "Calendar days to target completion",
              },
            ]}
          />
          <Panel title="Deliverable Pipeline State">
            <div className="panel-body">
              <div className="pipeline">
                {["To Do", "In Progress", "In Review", "Done", "Blocked"].map(
                  (s) => (
                    <div key={s}>
                      <strong>
                        {tasks.filter((t) => t.status === s).length}
                      </strong>
                      <Badge>{s}</Badge>
                    </div>
                  ),
                )}
              </div>
              <Progress value={percent} />
            </div>
          </Panel>
          <div className="detail-grid">
            <div className="stack">
              <Panel title="Concession Governance & Engineering Scope">
                <div className="panel-body">
                  <p className="preserve-lines">{p.description}</p>
                  <div className="metadata-grid">
                    <div>
                      <small>ASSET / LOCATION</small>
                      <strong>{p.location}</strong>
                    </div>
                    <div>
                      <small>PROJECT KEY</small>
                      <strong>{p.key}</strong>
                    </div>
                    <div>
                      <small>TARGET COMPLETION</small>
                      <strong>{calendarDate(p.dueDate)}</strong>
                    </div>
                  </div>
                </div>
              </Panel>
              <Panel
                title="Upcoming Milestones & Critical Deliverables"
                action={
                  <Link className="text-link" href={`/projects/${p.id}/tasks`}>
                    View All <ArrowUpRight size={13} />
                  </Link>
                }
              >
                {tasks.length ? (
                  <TaskTable
                    tasks={[...tasks]
                      .filter((t) => t.status !== "Done")
                      .sort((a, b) =>
                        (a.dueDate || "9999").localeCompare(
                          b.dueDate || "9999",
                        ),
                      )
                      .slice(0, 5)}
                  />
                ) : (
                  <Empty title="No deliverables yet" />
                )}
              </Panel>
            </div>
            <aside className="stack">
              <Panel
                title="Assigned Team"
                action={
                  <Link
                    className="text-link"
                    href={`/projects/${p.id}/members`}
                  >
                    View All
                  </Link>
                }
              >
                <div className="panel-body team-list">
                  {members.map((u) => (
                    <div className="person" key={u.id}>
                      <Avatar name={u.name} />
                      <span>
                        <strong>{u.name}</strong>
                        <small>
                          {p.managerId === u.id
                            ? "Lead Project Manager"
                            : u.title}
                        </small>
                      </span>
                    </div>
                  ))}
                </div>
              </Panel>
              <Panel title="Audit Trail & Activity">
                <div className="panel-body activity-list">
                  {activities.map((a) => (
                    <div key={a.id}>
                      <Avatar
                        name={
                          data.users.find((u) => u.id === a.authorId)?.name ??
                          "Former member"
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
                    <p className="muted">Project activity will appear here.</p>
                  )}
                </div>
              </Panel>
            </aside>
          </div>
        </>
      )}
      {edit && canManage(user, p) && (
        <ProjectForm project={p} onClose={() => setEdit(false)} />
      )}{" "}
      {task && canCreateTask(user, p) && (
        <TaskForm project={p} onClose={() => setTask(false)} />
      )}{" "}
      {archive && (
        <Modal title="Archive this project?" onClose={() => setArchive(false)}>
          <div className="modal-body">
            <Alert>
              Archiving makes all tasks and comments read-only. Historical
              records remain accessible to project members.
            </Alert>
            <p>
              <strong>{p.name}</strong>
            </p>
            <p>
              You can restore this project by editing its status as an
              Administrator.
            </p>
          </div>
          <div className="modal-footer">
            <button className="button" onClick={() => setArchive(false)}>
              Cancel
            </button>
            <button
              className="button danger"
              disabled={w.pending}
              onClick={async () => {
                if (
                  await w.execute({
                    kind: "project.save",
                    id: p.id,
                    expectedVersion: p.version,
                    input: { ...p, status: "Archived" },
                  })
                )
                  setArchive(false);
              }}
            >
              Archive Project
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
