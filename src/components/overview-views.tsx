"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Download, Plus, ShieldCheck } from "lucide-react";
import { canAccess, canCreateTask } from "@/domain/permissions";
import { calendarDate, dubaiToday, timestamp } from "@/domain/dates";
import { statuses } from "@/domain/types";
import { useWorkspace } from "./workspace-provider";
import {
  Avatar,
  Badge,
  downloadCsv,
  Empty,
  Heading,
  Panel,
  Progress,
  Stats,
} from "./ui";
import { ProjectCard } from "./project-views";
import { TaskCollection, TaskTable } from "./task-views";
import { TaskForm } from "./workspace-forms";
export function DashboardView() {
  const { data, user } = useWorkspace();
  const [create, setCreate] = useState(false);
  if (!data || !user) return null;
  const projects = data.projects.filter((p) => canAccess(user, p));
  const tasks = data.tasks.filter((t) =>
    projects.some((p) => p.id === t.projectId),
  );
  const open = tasks.filter((t) => t.status !== "Done");
  const critical = open.filter((t) => t.priority === "Critical");
  const overdue = open.filter((t) => t.dueDate && t.dueDate < dubaiToday());
  const done = tasks.length - open.length;
  const createProject = projects.find((p) => canCreateTask(user, p));
  const activities = data.activities
    .filter((a) => projects.some((p) => p.id === a.projectId))
    .slice(0, 6);
  return (
    <>
      <Heading
        eyebrow="OPERATIONS / WORKSPACE OVERVIEW"
        title="Executive Operations Cockpit"
        description={`Welcome back, ${user.name.split(" ")[0]}. A clear view of your UAE project portfolio and critical delivery priorities.`}
        actions={
          <>
            {createProject && (
              <button
                className="button primary"
                onClick={() => setCreate(true)}
              >
                <Plus size={15} />
                Create Task
              </button>
            )}
            <Link className="button" href="/reports">
              View Reports <ArrowUpRight size={15} />
            </Link>
          </>
        }
      />
      <Stats
        items={[
          {
            label: "ACCESSIBLE PROJECTS",
            value: projects.length,
            detail: `${projects.filter((p) => p.status === "Active").length} active workstreams`,
          },
          {
            label: "CRITICAL PRIORITIES",
            value: critical.length,
            detail: `${overdue.length} overdue deliverables`,
            kind: "red",
          },
          {
            label: "OPEN DELIVERABLES",
            value: open.length,
            detail: "Pending across accessible projects",
          },
          {
            label: "COMPLETION RATE",
            value: `${tasks.length ? Math.round((done / tasks.length) * 100) : 0}%`,
            detail: `${done} of ${tasks.length} tasks complete`,
            kind: "teal",
          },
        ]}
      />
      <div className="section-heading">
        <h2>Active Projects Portfolio</h2>
        <Link className="text-link" href="/projects">
          View All Projects <ArrowUpRight size={14} />
        </Link>
      </div>
      {projects.length ? (
        <div className="three-grid">
          {projects
            .filter((p) => p.status !== "Archived")
            .slice(0, 3)
            .map((p) => (
              <ProjectCard project={p} key={p.id} />
            ))}
        </div>
      ) : (
        <Panel>
          <Empty
            title="No project access yet"
            body="Your administrator can add you to project teams."
          />
        </Panel>
      )}
      <div className="detail-grid">
        <div className="stack">
          <Panel
            title="Task Requiring Attention"
            action={
              <Link className="text-link" href="/my-tasks">
                My Tasks →
              </Link>
            }
          >
            {open.length ? (
              <TaskTable
                tasks={[...open]
                  .sort(
                    (a, b) =>
                      (a.priority === "Critical" ? -1 : 1) -
                        (b.priority === "Critical" ? -1 : 1) ||
                      (a.dueDate || "9999").localeCompare(b.dueDate || "9999"),
                  )
                  .slice(0, 5)}
              />
            ) : (
              <Empty
                title="All caught up"
                body="There are no open tasks in accessible projects."
              />
            )}
          </Panel>
          <Panel title="Workspace Delivery Progress">
            <div className="panel-body status-summary">
              {statuses.map((s) => (
                <div key={s}>
                  <span>
                    <Badge>{s}</Badge>
                    <strong>
                      {tasks.filter((t) => t.status === s).length}
                    </strong>
                  </span>
                  <Progress
                    value={
                      tasks.length
                        ? Math.round(
                            (tasks.filter((t) => t.status === s).length /
                              tasks.length) *
                              100,
                          )
                        : 0
                    }
                  />
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <aside className="stack">
          <Panel title="Recent Audit & Activity">
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
                <p className="muted">
                  Activity will appear as your team works.
                </p>
              )}
            </div>
          </Panel>
          <Panel title="Active Permissions Scope">
            <div className="panel-body">
              <Badge kind="active">{user.role}</Badge>
              <p className="muted">
                Project access follows your workspace role and team membership.
                Assigned managers manage their own projects; members edit tasks
                assigned to them.
              </p>
              <Link className="text-link" href="/team">
                View Team & Access →
              </Link>
            </div>
          </Panel>
          <div className="teal-panel">
            <ShieldCheck size={24} />
            <h2>One connected workspace</h2>
            <Link href="/my-tasks">
              My Assigned Tasks <ArrowUpRight size={15} />
            </Link>
            <Link href="/reports">
              Reports & Analytics <ArrowUpRight size={15} />
            </Link>
            <Link href="/settings/account">
              Account Preferences <ArrowUpRight size={15} />
            </Link>
          </div>
        </aside>
      </div>
      {create && createProject && (
        <TaskForm project={createProject} onClose={() => setCreate(false)} />
      )}
    </>
  );
}
export function MyTasksView() {
  const { data, user } = useWorkspace();
  if (!data || !user) return null;
  const projects = data.projects.filter((p) => canAccess(user, p));
  const tasks = data.tasks.filter(
    (t) =>
      t.assigneeId === user.id && projects.some((p) => p.id === t.projectId),
  );
  const open = tasks.filter((t) => t.status !== "Done");
  return (
    <>
      <Heading
        eyebrow="PERSONAL WORKSPACE / ASSIGNED DELIVERABLES"
        title="My Assigned Deliverables & Tasks"
        description={`Personal engineering work queue for ${user.name}. Review priorities across all accessible project teams.`}
      />
      <Stats
        items={[
          {
            label: "ASSIGNED QUEUE",
            value: open.length,
            detail: "Open tasks assigned to you",
          },
          {
            label: "CRITICAL / IMMINENT",
            value: open.filter((t) => t.priority === "Critical").length,
            detail: "Require priority attention",
            kind: "red",
          },
          {
            label: "IN REVIEW / QA GATES",
            value: tasks.filter((t) => t.status === "In Review").length,
            detail: "Awaiting verification",
          },
          {
            label: "COMPLETED DELIVERABLES",
            value: tasks.filter((t) => t.status === "Done").length,
            detail: "Closed assigned work",
            kind: "teal",
          },
        ]}
      />
      <TaskCollection key={user.id} tasks={tasks} mine />
      <div className="three-grid">
        <Panel title="Upcoming Gate Deadlines">
          <div className="panel-body deadline-list">
            {[...open]
              .filter((t) => t.dueDate)
              .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
              .slice(0, 4)
              .map((t) => (
                <Link
                  key={t.id}
                  href={`/projects/${t.projectId}/tasks/${t.id}`}
                >
                  <Badge>{t.priority}</Badge>
                  <strong>{t.title}</strong>
                  <small>{calendarDate(t.dueDate)}</small>
                </Link>
              ))}
            {!open.length && (
              <p className="muted">No upcoming assigned work.</p>
            )}
          </div>
        </Panel>
        <Panel title="Your Project Access">
          <div className="panel-body deadline-list">
            {projects.map((p) => (
              <Link key={p.id} href={`/projects/${p.id}`}>
                <strong>{p.name}</strong>
                <Badge>{p.status}</Badge>
              </Link>
            ))}
          </div>
        </Panel>
        <Panel title="Operational Notes">
          <div className="panel-body">
            <p className="muted">
              Keep task status current so project boards and reports reflect
              your latest work. Due dates are calendar dates; activity
              timestamps use GST (UTC+4).
            </p>
          </div>
        </Panel>
      </div>
    </>
  );
}
export function ReportsView() {
  const { data, user } = useWorkspace();
  const [project, setProject] = useState("All");
  const [status, setStatus] = useState("All");
  if (!data || !user) return null;
  const accessible = data.projects.filter((p) => canAccess(user, p));
  const projects = accessible.filter(
    (p) => project === "All" || p.id === project,
  );
  const tasks = data.tasks.filter(
    (t) =>
      projects.some((p) => p.id === t.projectId) &&
      (status === "All" || t.status === status),
  );
  const completed = tasks.filter((t) => t.status === "Done").length;
  const percent = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;
  const overdue = tasks.filter(
    (t) => t.status !== "Done" && t.dueDate && t.dueDate < dubaiToday(),
  ).length;
  const exportReport = () =>
    downloadCsv("nexalis-delivery-report.csv", [
      ["Project", "Task", "Status", "Priority", "Assignee", "Due Date"],
      ...tasks.map((t) => [
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
      <Heading
        eyebrow="ANALYTICS / ACCESSIBLE PROJECT PORTFOLIO"
        title="Reports & Operational Analytics"
        description="Live calculations from the local demo dataset. Track delivery, critical work and assignment coverage."
        actions={
          <button className="button primary" onClick={exportReport}>
            <Download size={15} />
            Export Report
          </button>
        }
      />
      <div className="filter-row panel project-filters">
        <label className="field inline">
          Project scope
          <select
            aria-label="Report project scope"
            value={project}
            onChange={(e) => setProject(e.target.value)}
          >
            <option value="All">All accessible projects</option>
            {accessible.map((p) => (
              <option value={p.id} key={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field inline">
          Task status
          <select
            aria-label="Report task status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="All">All task statuses</option>
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <span className="report-scope">
          <ShieldCheck size={16} />
          Only projects you can access
        </span>
      </div>
      <Stats
        items={[
          {
            label: "DELIVERY COMPLETION",
            value: `${percent}%`,
            detail: `${completed} completed of ${tasks.length} tasks`,
            kind: "teal",
          },
          {
            label: "CRITICAL OPEN WORK",
            value: tasks.filter(
              (t) => t.priority === "Critical" && t.status !== "Done",
            ).length,
            detail: "Priority escalation candidates",
            kind: "red",
          },
          {
            label: "PAST DUE ITEMS",
            value: overdue,
            detail: `As of ${calendarDate(dubaiToday())}`,
          },
          {
            label: "ASSIGNMENT COVERAGE",
            value: `${tasks.length ? Math.round((tasks.filter((t) => t.assigneeId).length / tasks.length) * 100) : 0}%`,
            detail: "Tasks with an assigned member",
          },
        ]}
      />
      <div className="detail-grid">
        <Panel title="Deliverable Status Distribution">
          <div className="panel-body chart-panel">
            <div
              className="bar-chart"
              role="img"
              aria-label={statuses
                .map(
                  (s) => `${s}: ${tasks.filter((t) => t.status === s).length}`,
                )
                .join(", ")}
            >
              {statuses.map((s) => {
                const count = tasks.filter((t) => t.status === s).length;
                return (
                  <div className="bar-column" key={s}>
                    <strong>{count}</strong>
                    <div
                      className={`chart-bar bar-${s.toLowerCase().replaceAll(" ", "-")}`}
                      style={{
                        height: `${Math.max(4, tasks.length ? (count / tasks.length) * 180 : 4)}px`,
                      }}
                    />
                    <span>{s}</span>
                  </div>
                );
              })}
            </div>
            <p className="muted">
              Task counts in the selected scope. No historical trend data is
              fabricated.
            </p>
          </div>
        </Panel>
        <Panel title="Project Completion & Load">
          <div className="panel-body status-summary">
            {projects.map((p) => {
              const group = tasks.filter((t) => t.projectId === p.id);
              const done = group.filter((t) => t.status === "Done").length;
              return (
                <div key={p.id}>
                  <span>
                    <Link href={`/projects/${p.id}`}>
                      <strong>{p.name}</strong>
                    </Link>
                    <small>
                      {done} / {group.length}
                    </small>
                  </span>
                  <Progress
                    value={
                      group.length ? Math.round((done / group.length) * 100) : 0
                    }
                  />
                </div>
              );
            })}
            {!projects.length && (
              <p className="muted">No accessible project data.</p>
            )}
          </div>
        </Panel>
      </div>
      <Panel
        title="Consolidated Deliverable Report"
        action={<span className="muted">{tasks.length} records in scope</span>}
      >
        {tasks.length ? (
          <TaskTable tasks={tasks} showProject />
        ) : (
          <Empty
            title="No report data"
            body="Choose another scope or add work to an accessible project."
          />
        )}
      </Panel>
    </>
  );
}
