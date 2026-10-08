"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowUpRight,
  Bell,
  ChartNoAxesCombined,
  CircleHelp,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  SquareKanban,
  Users,
  X,
} from "lucide-react";
import { canAccess, canCreateTask } from "@/domain/permissions";
import { useWorkspace } from "./workspace-provider";
import { Avatar, Badge, Loading, Modal, State } from "./ui";
import { TaskForm } from "./workspace-forms";
const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/my-tasks", label: "My Tasks", icon: ListChecks },
  { href: "/team", label: "Team & Access", icon: Users },
  { href: "/reports", label: "Reports", icon: ChartNoAxesCombined },
];
export function Shell({ children }: { children: ReactNode }) {
  const sidebarRef = useRef<HTMLElement>(null);
  const w = useWorkspace();
  const path = usePathname();
  const router = useRouter();
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState<string | null>(null);
  const [taskOpen, setTaskOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [clock, setClock] = useState("GST (UTC+4)");
  useEffect(() => {
    const tick = () =>
      setClock(
        new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Dubai",
        }).format(new Date()) + " GST · Abu Dhabi",
      );
    tick();
    const timer = setInterval(tick, 60000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (w.ready && !w.user && w.mode === "demo" && !w.error)
      router.replace("/login?next=" + encodeURIComponent(path));
  }, [w.ready, w.user, w.mode, w.error, router, path]);
  useEffect(() => {
    if (!mobile) return;
    const previous = document.activeElement as HTMLElement | null;
    const aside = sidebarRef.current;
    aside?.querySelector<HTMLElement>("a,button")?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobile(false);
        return;
      }
      if (event.key === "Tab" && aside) {
        const focusable = Array.from(
          aside.querySelectorAll<HTMLElement>("a[href],button:not([disabled])"),
        );
        const first = focusable[0],
          last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, [mobile]);
  if (!w.ready) return <Loading />;
  if (w.mode !== "demo")
    return (
      <State
        title="Live integration required"
        body={w.error}
        code="CONFIGURATION"
        action={
          <p>
            Set NEXT_PUBLIC_DATA_MODE=demo to explicitly preview synthetic data.
          </p>
        }
      />
    );
  if (!w.user || !w.data)
    return (
      <State
        title={w.error ? "Session unavailable" : "Sign in to your workspace"}
        body={
          w.error || "Choose a demo persona to explore the Nexalis workspace."
        }
        code="SESSION"
        action={
          <Link
            className="button primary"
            href={"/login?next=" + encodeURIComponent(path)}
          >
            Go to account entry
          </Link>
        }
      />
    );
  const { data, user } = w;
  const projects = data.projects.filter((p) => canAccess(user, p));
  const first =
    projects.find((p) => path.startsWith("/projects/" + p.id)) ?? projects[0];
  const createProjects = projects.filter((p) => canCreateTask(user, p));
  const activeTasks = data.tasks.filter(
    (t) =>
      t.assigneeId === user.id &&
      t.status !== "Done" &&
      projects.some((p) => p.id === t.projectId),
  ).length;
  const items = [
    ...nav.slice(0, 2),
    ...(first
      ? [
          {
            href: `/projects/${first.id}/board`,
            label: "Board",
            icon: SquareKanban,
          },
          {
            href: `/projects/${first.id}/tasks`,
            label: "Task List",
            icon: ClipboardList,
          },
        ]
      : []),
    ...nav.slice(2),
  ];
  return (
    <div
      className={`workspace ${data.preferences[user.id]?.compact ? "compact" : ""}`}
    >
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {mobile && (
        <button
          className="nav-scrim"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <aside
        ref={sidebarRef}
        id="workspace-navigation"
        className={`sidebar ${mobile ? "open" : ""}`}
        aria-label="Workspace navigation"
      >
        <Link href="/dashboard" className="brand">
          <span className="brand-mark">✣</span>
          <span>
            Nexalis Workspace<small>UAE OPERATIONS</small>
          </span>
        </Link>
        <button
          className="mobile-close icon-button"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        >
          <X size={20} />
        </button>
        <div className="sidebar-context">
          <Activity size={14} />
          <div>
            <small>OPERATING UNIT</small>
            <strong>Habsan–Fujairah · Shift B</strong>
          </div>
        </div>
        <nav>
          {items.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-label={n.label}
              className={`nav-item ${path === n.href || (n.href === "/projects" && path.startsWith("/projects") && !path.endsWith("/board") && !path.endsWith("/tasks")) ? "active" : ""}`}
              onClick={() => setMobile(false)}
            >
              <n.icon size={17} />
              <span>{n.label}</span>
              {n.href === "/my-tasks" && (
                <span className="nav-count">{activeTasks}</span>
              )}
            </Link>
          ))}
          <Link
            className={`nav-item ${path.startsWith("/settings") ? "active" : ""}`}
            href="/settings/account"
            aria-label="Settings"
            onClick={() => setMobile(false)}
          >
            <Settings size={17} />
            <span>Settings</span>
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <Link
            className="nav-item"
            href="/system-states"
            aria-label="Demo and system states"
          >
            <CircleHelp size={16} />
            <span>Demo & system states</span>
          </Link>
          <div className="telemetry">
            <i />
            LOCAL DEMO<small>Synthetic data · No live services</small>
          </div>
        </div>
      </aside>
      <div className="workspace-body">
        <header className="topbar">
          <button
            aria-label="Open navigation"
            aria-expanded={mobile}
            aria-controls="workspace-navigation"
            className="icon-button menu-toggle"
            onClick={() => setMobile(true)}
          >
            <Menu size={20} />
          </button>
          <div className="breadcrumbs">
            <Link href="/dashboard">Nexalis Workspace</Link>
            <span>/</span>
            <strong>
              {path.split("/")[1] === "my-tasks"
                ? "My Tasks"
                : path.split("/")[1].replace(/^./, (c) => c.toUpperCase())}
            </strong>
          </div>
          <button
            className="search-trigger"
            aria-label="Search workspace"
            onClick={() => setSearch("")}
          >
            <Search size={15} />
            <span>Search workspace</span>
            <kbd>⌕</kbd>
          </button>
          <span className="clock">{clock}</span>
          <button
            className="icon-button"
            aria-label="Recent activity"
            onClick={() => setActivityOpen(true)}
          >
            <Bell size={18} />
            <i className="notification-dot" />
          </button>
          {createProjects.length > 0 && (
            <button
              className="button primary small-button top-create"
              onClick={() => setTaskOpen(true)}
            >
              <Plus size={15} />
              Create Task
            </button>
          )}
          <Link
            className="user-link"
            aria-label="Account and preferences"
            href="/settings/account"
          >
            <Avatar name={user.name} small />
            <span>
              {user.name}
              <small>{user.role}</small>
            </span>
          </Link>
          <button
            className="icon-button"
            aria-label="Sign out"
            onClick={() => {
              w.logout();
              router.push("/login");
            }}
          >
            <LogOut size={16} />
          </button>
        </header>
        <div className="demo-toolbar">
          <ShieldCheck size={14} />
          <span>DEMO PERSONA</span>
          <select
            aria-label="Demo persona"
            value={user.id}
            onChange={async (e) => {
              await w.login(e.target.value);
              setMobile(false);
            }}
            disabled={w.pending}
          >
            {data.users
              .filter((u) => u.active)
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} · {u.role}
                </option>
              ))}
          </select>
          <Badge kind="active">Local browser storage</Badge>
          <Link href="/system-states">
            Inspect demo states <ArrowUpRight size={13} />
          </Link>
        </div>
        <main id="main-content" className="main-content">
          {w.error && (
            <div className="global-error" role="alert">
              <strong>Action needs attention</strong>
              <p>{w.error}</p>
              <button className="button" onClick={w.reload}>
                Reload latest data
              </button>
            </div>
          )}
          {children}
        </main>
        <footer className="footer">
          <span>
            <i />
            Nexalis International Oil & Gas · UAE
          </span>
          <span>Asia/Dubai · Calendar due dates</span>
          <span>Local demo · No email delivery</span>
        </footer>
      </div>
      {w.notice && (
        <div className="toast" role="status">
          <ShieldCheck size={17} />
          {w.notice}
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => w.notify("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
      {taskOpen && createProjects.length > 0 && (
        <TaskForm
          project={
            createProjects.find((p) => path.includes(p.id)) ?? createProjects[0]
          }
          onClose={() => setTaskOpen(false)}
        />
      )}
      {search !== null && (
        <Modal title="Search workspace" onClose={() => setSearch(null)}>
          <div className="modal-body">
            <label className="field">
              Search projects and tasks
              <input
                autoFocus
                placeholder="Search by title or project key…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <div className="search-results">
              {projects
                .filter((p) =>
                  (p.name + " " + p.key)
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
                .map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    onClick={() => setSearch(null)}
                  >
                    <FolderKanban size={18} />
                    <div>
                      <strong>{p.name}</strong>
                      <small>Project · {p.key}</small>
                    </div>
                    <ArrowUpRight size={15} />
                  </Link>
                ))}
              {data.tasks
                .filter(
                  (t) =>
                    projects.some((p) => p.id === t.projectId) &&
                    t.title.toLowerCase().includes(search.toLowerCase()),
                )
                .slice(0, 20)
                .map((t) => (
                  <Link
                    key={t.id}
                    href={`/projects/${t.projectId}/tasks/${t.id}`}
                    onClick={() => setSearch(null)}
                  >
                    <ClipboardList size={18} />
                    <div>
                      <strong>{t.title}</strong>
                      <small>Task · {t.status}</small>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </Modal>
      )}
      {activityOpen && (
        <Modal
          title="Recent workspace activity"
          onClose={() => setActivityOpen(false)}
        >
          <div className="modal-body activity-list">
            {data.activities
              .filter((a) => projects.some((p) => p.id === a.projectId))
              .slice(0, 30)
              .map((a) => (
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
                    <small>
                      {new Date(a.createdAt).toLocaleString("en-GB", {
                        timeZone: "Asia/Dubai",
                      })}{" "}
                      GST
                    </small>
                  </p>
                </div>
              ))}
            {!data.activities.length && <p>No activity yet.</p>}
          </div>
        </Modal>
      )}
    </div>
  );
}
