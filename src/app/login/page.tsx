"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  LockKeyhole,
  ShieldCheck,
  Activity,
  Globe,
  Waves,
} from "lucide-react";
import type { User } from "@/domain/types";
import { DemoService } from "@/services/demo-service";
import { useWorkspace } from "@/components/workspace-provider";
import { Alert, Loading } from "@/components/ui";
export default function Login() {
  const w = useWorkspace();
  const router = useRouter();
  const [persona, setPersona] = useState("tariq");
  const [directory, setDirectory] = useState<User[]>([]);
  const [directoryError, setDirectoryError] = useState("");
  const { ready, mode, data } = w;
  useEffect(() => {
    if (!ready || mode !== "demo") return;
    let active = true;
    // Only synthetic demo identities are public at account entry.
    new DemoService()
      .load()
      .then((snapshot) => {
        if (!active) return;
        setDirectory(snapshot.users);
        setDirectoryError("");
        setPersona((current) =>
          snapshot.users.some((u) => u.id === current && u.active)
            ? current
            : (snapshot.users.find((u) => u.active)?.id ?? ""),
        );
      })
      .catch((error) => {
        if (active) setDirectoryError(error.message);
      });
    return () => {
      active = false;
    };
  }, [ready, mode, data]);
  if (!w.ready) return <Loading />;
  const users = directory;
  return (
    <div className="login-page">
      <header className="login-header">
        <Link href="/login" className="brand">
          <span className="brand-mark">✣</span>
          <span>
            Nexalis Workspace<small>ENERGY ASSET INFRASTRUCTURE</small>
          </span>
        </Link>
        <span className="clock">
          <i />
          UAE Regional Operations · GST (UTC+4)
        </span>
      </header>
      <main className="login-content">
        <div className="login-demo">
          <ShieldCheck size={18} />
          <div>
            <strong>Interactive local demo</strong>
            <p>
              Explore role-based project and task management with synthetic
              data.
            </p>
          </div>
          <span className="badge badge-active">NO LIVE AUTHENTICATION</span>
        </div>
        <div className="login-grid">
          <section className="panel login-card">
            <div className="login-card-head">
              <LockKeyhole size={22} />
              <div>
                <strong>NEXALIS WORKSPACE</strong>
                <small>UAE Regional Operations · Project Management</small>
              </div>
            </div>
            <div className="login-card-body">
              <div className="eyebrow">YOUR OPERATIONS. ONE WORKSPACE.</div>
              <h1>Sign in to Nexalis Workspace</h1>
              <p>
                Coordinate projects, review engineering deliverables and keep
                your team moving forward.
              </p>
              <Alert success>
                This preview uses local browser data. Firebase sign-in,
                Firestore writes and business emails are not connected.
              </Alert>
              {w.error && <Alert>{w.error}</Alert>}
              {directoryError && <Alert>{directoryError}</Alert>}
              {(w.error || directoryError) && w.mode === "demo" && (
                <button
                  className="button"
                  onClick={async () => {
                    if (
                      confirm(
                        "Restore the initial demo dataset? All local demo changes will be cleared.",
                      )
                    )
                      await w.reset();
                  }}
                >
                  Reset Local Demo Data
                </button>
              )}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!(await w.login(persona))) return;
                  const requested = new URLSearchParams(
                    window.location.search,
                  ).get("next");
                  const target =
                    requested?.startsWith("/") &&
                    !requested.startsWith("//") &&
                    !requested.includes("\\")
                      ? requested
                      : "/dashboard";
                  router.push(target);
                }}
              >
                <label className="field">
                  Demo workspace identity
                  <select
                    value={persona}
                    onChange={(e) => setPersona(e.target.value)}
                  >
                    {users
                      .filter((u) => u.active)
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} — {u.role}
                        </option>
                      ))}
                  </select>
                </label>
                <div className="identity-preview">
                  <ShieldCheck size={16} />
                  <span>
                    {users.find((u) => u.id === persona)?.email}
                    <small>No password required for this synthetic demo</small>
                  </span>
                </div>
                <button
                  disabled={w.pending || w.mode !== "demo" || !users.length}
                  className="button primary full"
                >
                  {w.pending ? "Opening workspace…" : "Enter demo workspace"}
                  <ArrowRight size={17} />
                </button>
              </form>
              <div className="login-help">
                <Globe size={17} />
                <p>
                  Built for teams across the UAE.
                  <small>
                    Operational timestamps use Asia/Dubai. Due dates stay on
                    their calendar day.
                  </small>
                </p>
              </div>
            </div>
          </section>
          <aside className="login-aside">
            <section className="operations-visual">
              <div className="grid-lines" />
              <Waves size={70} strokeWidth={1} />
              <span className="eyebrow">OPERATIONAL COORDINATION</span>
              <h2>
                Connected teams.
                <br />
                Clearer delivery.
              </h2>
              <div className="operating-line">
                <i />
                <span>UAE · ENGINEERING · OPERATIONS</span>
              </div>
            </section>
            <PanelNotes />
          </aside>
        </div>
      </main>
      <footer className="login-footer">
        © 2026 Nexalis International Oil & Gas · UAE
        <span>Demo environment · Local data only</span>
      </footer>
    </div>
  );
}
function PanelNotes() {
  return (
    <section className="panel security-notes">
      <h2>Workspace access</h2>
      <div>
        <ShieldCheck size={20} />
        <p>
          <strong>Role-aware workflows</strong>
          <small>
            Administrators, project managers, team members and viewers each have
            clear responsibilities.
          </small>
        </p>
      </div>
      <div>
        <Activity size={20} />
        <p>
          <strong>One source of project progress</strong>
          <small>
            Boards, task lists, personal work and reports stay consistent as
            tasks change.
          </small>
        </p>
      </div>
    </section>
  );
}
