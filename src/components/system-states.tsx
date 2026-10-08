"use client";
import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, Check, Lock, RefreshCw, WifiOff } from "lucide-react";
import { useWorkspace } from "./workspace-provider";
import { Alert, Empty, Heading, Loading, Modal, Panel, State } from "./ui";
export function SystemStatesView() {
  const w = useWorkspace();
  const [state, setState] = useState("access");
  const [reset, setReset] = useState(false);
  const [unsaved, setUnsaved] = useState(false);
  const [draft, setDraft] = useState("");
  return (
    <>
      <Heading
        eyebrow="SYSTEM CATALOG / INTERACTIVE DEMO SIMULATOR"
        title="Workspace States & Recovery"
        description="Inspect operational boundaries and simulate local recovery scenarios without contacting live services."
      />
      <div className="state-switcher panel">
        {[
          ["access", "Access denied"],
          ["missing", "Not found"],
          ["network", "Network failure"],
          ["loading", "Loading"],
          ["empty", "Empty data"],
          ["archived", "Archived project"],
          ["success", "Success"],
        ].map(([k, label]) => (
          <button
            className={`button ${state === k ? "primary" : ""}`}
            key={k}
            onClick={() => setState(k)}
          >
            {label}
          </button>
        ))}
      </div>
      {state === "access" && (
        <State
          headingLevel={2}
          title="Access Restricted — Project Workspace"
          body="Your role and project membership do not grant access to this operational project. Contact the workspace Administrator to request membership."
        />
      )}
      {state === "missing" && (
        <State
          headingLevel={2}
          code="404"
          title="Deliverable not found"
          body="This task may have moved, or the link is incomplete. Return to your accessible project directory."
          action={
            <Link className="button primary" href="/projects">
              View Projects
            </Link>
          }
        />
      )}
      {state === "network" && (
        <State
          headingLevel={2}
          code="OFFLINE"
          title="Unable to reach the workspace service"
          body="Your unsaved changes remain in the open form. Retry the request after connectivity returns."
          action={
            <button
              className="button primary"
              onClick={() => {
                setState("success");
                w.notify("Recovery preview completed. No request was sent.");
              }}
            >
              <RefreshCw size={16} />
              Preview Retry
            </button>
          }
        />
      )}
      {state === "loading" && (
        <Panel>
          <Loading />
        </Panel>
      )}
      {state === "empty" && (
        <Panel>
          <Empty
            title="No deliverables in this view"
            body="Change your filters, switch projects or create the first task if your role allows it."
            action={
              <Link className="button primary" href="/projects">
                View Projects
              </Link>
            }
          />
        </Panel>
      )}
      {state === "archived" && (
        <Alert>
          Archived project · Historical records are readable. Task creation,
          editing, comments and membership changes are disabled. Administrators
          can restore the project through Edit Project.
        </Alert>
      )}
      {state === "success" && (
        <Alert success>
          <Check size={17} />
          Changes saved. Connected project views now reflect the latest local
          data.
        </Alert>
      )}
      <div className="section-heading">
        <h2>State Catalog & Interaction Simulator</h2>
      </div>
      <div className="four-grid">
        <Panel title="Failed Mutation">
          <div className="panel-body">
            <WifiOff size={24} />
            <p>
              Fail the next local mutation to verify error recovery. Existing
              data stays unchanged.
            </p>
            <button className="button" onClick={w.failNext}>
              Fail Next Mutation
            </button>
          </div>
        </Panel>
        <Panel title="Session Expiry">
          <div className="panel-body">
            <Lock size={24} />
            <p>
              Expire this tab’s demo session and clear the protected in-memory
              workspace.
            </p>
            <button className="button" onClick={w.expire}>
              Expire Demo Session
            </button>
          </div>
        </Panel>
        <Panel title="Unsaved Changes">
          <div className="panel-body">
            <AlertTriangle size={24} />
            <p>
              Open a draft, type a change and try closing the dialog with Escape
              or Cancel.
            </p>
            <button
              className="button"
              onClick={() => {
                setUnsaved(true);
                setDraft("");
              }}
            >
              Open Draft
            </button>
          </div>
        </Panel>
        <Panel title="Reset Local Data">
          <div className="panel-body">
            <RefreshCw size={24} />
            <p>
              Restore synthetic records to their initial state in this browser.
            </p>
            <button className="button danger" onClick={() => setReset(true)}>
              Reset Demo Data
            </button>
          </div>
        </Panel>
      </div>
      <Alert success>
        Frontend guards and demo command checks demonstrate expected behavior.
        They do not prove production authorization. A live backend must enforce
        these permissions.
      </Alert>
      {reset && (
        <Modal title="Reset Local Demo Data?" onClose={() => setReset(false)}>
          <div className="modal-body">
            <Alert>
              This clears all locally created demo projects, tasks, comments,
              profiles and preferences. The original synthetic dataset will be
              restored for every tab in this browser.
            </Alert>
          </div>
          <div className="modal-footer">
            <button className="button" onClick={() => setReset(false)}>
              Cancel
            </button>
            <button
              className="button danger"
              onClick={async () => {
                await w.reset();
                setReset(false);
              }}
            >
              Reset Demo Data
            </button>
          </div>
        </Modal>
      )}
      {unsaved && (
        <Modal
          title="Unsaved Draft Preview"
          dirty={!!draft}
          onClose={() => setUnsaved(false)}
        >
          <div className="modal-body">
            <label className="field">
              Draft text
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type here, then try closing…"
              />
            </label>
          </div>
        </Modal>
      )}
    </>
  );
}
