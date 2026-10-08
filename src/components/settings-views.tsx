"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Bell,
  Building2,
  Globe,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { isAdmin } from "@/domain/permissions";
import type { User, Workspace } from "@/domain/types";
import { useWorkspace } from "./workspace-provider";
import {
  Alert,
  Avatar,
  Badge,
  Heading,
  Panel,
  State,
  useUnsavedChanges,
} from "./ui";
export function SettingsNav({ workspace = false }: { workspace?: boolean }) {
  const { user } = useWorkspace();
  return (
    <nav className="project-tabs" aria-label="Settings">
      <Link className={!workspace ? "active" : ""} href="/settings/account">
        <UserRound size={15} />
        Profile & Preferences
      </Link>
      {isAdmin(user) && (
        <Link className={workspace ? "active" : ""} href="/settings/workspace">
          <Building2 size={15} />
          Workspace Governance
        </Link>
      )}
    </nav>
  );
}
export function AccountView() {
  const { user } = useWorkspace();
  if (!user) return null;
  return <AccountForm key={user.id} original={user} />;
}
function AccountForm({ original }: { original: User }) {
  const w = useWorkspace();
  const { data, user } = w;
  const [name, setName] = useState(original.name);
  const [title, setTitle] = useState(original.title);
  const [version, setVersion] = useState(original.version);
  const [dirty, setDirty] = useState(false);
  const [prefs, setPrefs] = useState(
    data!.preferences[original.id] ?? {
      emailNotifications: false,
      compact: false,
    },
  );
  const [prefsDirty, setPrefsDirty] = useState(false);
  useUnsavedChanges(dirty || prefsDirty);
  if (!data || !user) return null;
  return (
    <>
      <Heading
        eyebrow="IAM & SETTINGS / ACCOUNT PREFERENCES"
        title="Identity & Account Preferences"
        description="Manage your workspace profile, display preferences and operational settings."
      />
      <SettingsNav />
      <div className="detail-grid">
        <div className="stack">
          <Panel title="Personal Identity">
            <form
              className="panel-body"
              onSubmit={async (e) => {
                e.preventDefault();
                if (
                  await w.execute({
                    kind: "profile.save",
                    name,
                    title,
                    expectedVersion: version,
                  })
                ) {
                  setVersion(version + 1);
                  setDirty(false);
                }
              }}
            >
              <div className="profile-heading">
                <Avatar name={user.name} />
                <div>
                  <h2>{user.name}</h2>
                  <p>{user.title}</p>
                  <Badge kind="active">{user.role}</Badge>
                </div>
              </div>
              <div className="form-grid">
                <label className="field">
                  Full name
                  <input
                    required
                    maxLength={120}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setDirty(true);
                    }}
                  />
                </label>
                <label className="field">
                  Corporate email
                  <input value={user.email} disabled />
                  <small>Managed by workspace Administrators</small>
                </label>
              </div>
              <label className="field">
                Job title / operational designation
                <input
                  maxLength={180}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setDirty(true);
                  }}
                />
              </label>
              <div className="form-actions">
                <small>
                  {dirty ? "Unsaved profile changes" : "Profile saved"}
                </small>
                <button
                  className="button primary"
                  disabled={w.pending || !dirty}
                >
                  <Save size={15} />
                  Save Profile
                </button>
              </div>
            </form>
          </Panel>
          <Panel title="Regional & Operational Clock">
            <div className="panel-body">
              <Alert success>
                <Globe size={16} />
                Workspace timestamps use GST (UTC+4), Asia/Dubai. Due dates are
                stored as calendar dates.
              </Alert>
              <div className="form-grid">
                <label className="field">
                  Operational timezone
                  <input value="Asia/Dubai — Gulf Standard Time" readOnly />
                </label>
                <label className="field">
                  Language
                  <input value="English (UK)" readOnly />
                </label>
              </div>
            </div>
          </Panel>
          <Panel title="Display & Notification Preferences">
            <form
              className="panel-body"
              onSubmit={async (e) => {
                e.preventDefault();
                if (await w.execute({ kind: "preferences.save", input: prefs }))
                  setPrefsDirty(false);
              }}
            >
              <label className="preference-row">
                <span>
                  <strong>Compact workspace density</strong>
                  <small>
                    Reduce table padding for dense engineering workflows.
                  </small>
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  checked={prefs.compact}
                  onChange={(e) => {
                    setPrefs({ ...prefs, compact: e.target.checked });
                    setPrefsDirty(true);
                  }}
                />
              </label>
              <label className="preference-row">
                <span>
                  <strong>Email notification preference</strong>
                  <small>
                    Preference only. No emails are sent by this demo.
                  </small>
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  checked={prefs.emailNotifications}
                  onChange={(e) => {
                    setPrefs({
                      ...prefs,
                      emailNotifications: e.target.checked,
                    });
                    setPrefsDirty(true);
                  }}
                />
              </label>
              <div className="form-actions">
                <small>
                  {prefsDirty
                    ? "Unsaved preference changes"
                    : "Preferences saved"}
                </small>
                <button
                  className="button primary"
                  disabled={w.pending || !prefsDirty}
                >
                  <Bell size={15} />
                  Save Preferences
                </button>
              </div>
            </form>
          </Panel>
        </div>
        <aside className="stack">
          <Panel title="Workspace Role & Governance">
            <div className="panel-body">
              <ShieldCheck size={28} />
              <h3>{user.role}</h3>
              <p className="muted">
                Workspace roles are managed by Administrators. Project manager
                privileges apply only to projects assigned to you.
              </p>
              <Link className="text-link" href="/team">
                View Team & Access →
              </Link>
            </div>
          </Panel>
          <Panel title="Session & Data Mode">
            <div className="panel-body">
              <Badge kind="active">LOCAL DEMO</Badge>
              <p className="muted">
                Demo identities are synthetic. Session selection is stored in
                this tab for 12 hours. Workspace data is stored in this browser.
              </p>
              <button
                className="button"
                onClick={() => {
                  if (
                    (!dirty && !prefsDirty) ||
                    confirm("Discard unsaved changes and sign out?")
                  )
                    w.logout();
                }}
              >
                Sign Out
              </button>
            </div>
          </Panel>
        </aside>
      </div>
    </>
  );
}
export function WorkspaceSettingsView() {
  const { data, user } = useWorkspace();
  if (!data || !user) return null;
  if (!isAdmin(user))
    return (
      <State
        title="Workspace settings require Administrator access"
        body="Your role can manage personal preferences. Workspace governance is restricted to active Administrators."
      />
    );
  return <WorkspaceSettingsForm key={user.id} original={data.workspace} />;
}
function WorkspaceSettingsForm({ original }: { original: Workspace }) {
  const w = useWorkspace();
  const [name, setName] = useState(original.name);
  const [region, setRegion] = useState(original.region);
  const [version, setVersion] = useState(original.version);
  const [dirty, setDirty] = useState(false);
  useUnsavedChanges(dirty);
  return (
    <>
      <Heading
        eyebrow="WORKSPACE / GOVERNANCE & CONFIGURATION"
        title="Workspace Settings"
        description="Administer workspace identity and review integration readiness."
      />
      <SettingsNav workspace />
      <Alert success>
        Administrator access · Changes affect this local synthetic workspace
        only.
      </Alert>
      <div className="detail-grid">
        <div className="stack">
          <Panel title="Workspace Identity & Regional Profile">
            <form
              className="panel-body"
              onSubmit={async (e) => {
                e.preventDefault();
                if (
                  await w.execute({
                    kind: "workspace.save",
                    expectedVersion: version,
                    name,
                    region,
                  })
                ) {
                  setVersion(version + 1);
                  setDirty(false);
                }
              }}
            >
              <label className="field">
                Workspace name
                <input
                  required
                  maxLength={180}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setDirty(true);
                  }}
                />
              </label>
              <label className="field">
                Operating region
                <input
                  required
                  maxLength={180}
                  value={region}
                  onChange={(e) => {
                    setRegion(e.target.value);
                    setDirty(true);
                  }}
                />
              </label>
              <label className="field">
                Operational timezone
                <input value="Asia/Dubai — GST (UTC+4)" readOnly />
              </label>
              <div className="form-actions">
                <small>
                  {dirty
                    ? "Unsaved workspace changes"
                    : "Workspace settings saved"}
                </small>
                <button
                  className="button primary"
                  disabled={w.pending || !dirty}
                >
                  <Save size={15} />
                  Save Workspace
                </button>
              </div>
            </form>
          </Panel>
          <Panel title="Data & Business Event Governance">
            <div className="panel-body">
              <div className="integration-row">
                <span>
                  <strong>Firebase Authentication</strong>
                  <small>Authenticated sessions and account verification</small>
                </span>
                <Badge kind="inactive">Not connected</Badge>
              </div>
              <div className="integration-row">
                <span>
                  <strong>Firestore & authorized mutations</strong>
                  <small>Server-side role and membership enforcement</small>
                </span>
                <Badge kind="inactive">Not connected</Badge>
              </div>
              <div className="integration-row">
                <span>
                  <strong>Business email events</strong>
                  <small>Delivery follows successful backend events only</small>
                </span>
                <Badge kind="inactive">Not connected</Badge>
              </div>
              <p className="muted">
                Set live mode only after supplying the backend service
                implementation. Live mode fails closed; it never falls back to
                synthetic data.
              </p>
            </div>
          </Panel>
          <Panel title="Project Lifecycle & Retention">
            <div className="panel-body">
              <p>
                Archived projects remain readable. Task edits, new tasks,
                comments and membership changes are disabled until an
                Administrator restores the project.
              </p>
              <p className="muted">
                Production retention policies must be enforced by the backend.
                This demo does not delete archived records automatically.
              </p>
              <Link className="button" href="/projects">
                Manage Projects
              </Link>
            </div>
          </Panel>
        </div>
        <aside className="stack">
          <Panel title="Administrator Safeguards">
            <div className="panel-body">
              <ShieldCheck size={26} />
              <h3>Protect continuity</h3>
              <p className="muted">
                The last active Administrator cannot be demoted or deactivated.
                Managers must be replaced before deactivation.
              </p>
              <Link className="text-link" href="/team">
                Manage workspace team →
              </Link>
            </div>
          </Panel>
          <Panel title="Demo Recovery Tools">
            <div className="panel-body">
              <p className="muted">
                Inspect session expiry, request failures and recovery states in
                the local simulator.
              </p>
              <Link className="button" href="/system-states">
                Open System States
              </Link>
            </div>
          </Panel>
        </aside>
      </div>
    </>
  );
}
