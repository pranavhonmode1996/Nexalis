"use client";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  FolderKanban,
  FolderOpen,
  X,
} from "lucide-react";
export function Badge({
  children,
  kind,
}: {
  children: ReactNode;
  kind?: string;
}) {
  const k = (kind ?? String(children)).toLowerCase().replaceAll(" ", "-");
  return <span className={`badge badge-${k}`}>{children}</span>;
}
export function Avatar({
  name,
  small = false,
}: {
  name: string;
  small?: boolean;
}) {
  return (
    <span
      className={`avatar ${small ? "small" : ""}`}
      title={name}
      aria-label={name}
    >
      {name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")}
    </span>
  );
}
export function Heading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
}
export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      {title && (
        <div className="panel-heading">
          <h2>{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
export function Empty({
  title = "No results found",
  body = "Try adjusting your search or filters.",
  action,
}: {
  title?: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <FolderOpen size={32} />
      <h2>{title}</h2>
      <p>{body}</p>
      {action}
    </div>
  );
}
export function State({
  title,
  body,
  code = "403",
  action,
  headingLevel = 1,
}: {
  title: string;
  body: string;
  code?: string;
  action?: ReactNode;
  headingLevel?: 1 | 2;
}) {
  const Title = headingLevel === 1 ? "h1" : "h2";
  return (
    <div className="state panel">
      <span className="state-symbol">
        <AlertCircle size={30} />
      </span>
      <div className="eyebrow">NEXALIS WORKSPACE · {code}</div>
      <Title>{title}</Title>
      <p>{body}</p>
      <div className="actions">
        {action ?? (
          <Link className="button primary" href="/dashboard">
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>
        )}
      </div>
    </div>
  );
}
export function Loading() {
  return (
    <div role="status" className="loading">
      <span className="spinner" />
      Loading workspace…
      <div className="skeleton" />
      <div className="skeleton" />
    </div>
  );
}
export function Progress({ value }: { value: number }) {
  return (
    <div
      className="progress"
      role="progressbar"
      aria-label="Completed tasks"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${value}%` }} />
    </div>
  );
}
export function useUnsavedChanges(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const unload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    const links = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a[href]");
      if (
        a &&
        !a.getAttribute("href")?.startsWith("#") &&
        !window.confirm("Discard your unsaved changes?")
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", links, true);
    return () => {
      window.removeEventListener("beforeunload", unload);
      document.removeEventListener("click", links, true);
    };
  }, [dirty]);
}
export function Modal({
  title,
  children,
  onClose,
  dirty = false,
  drawer = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  dirty?: boolean;
  drawer?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useUnsavedChanges(dirty);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => {
      dialog?.close();
      previous?.focus();
    };
  }, []);
  const requestClose = () => {
    if (!dirty || window.confirm("Discard your unsaved changes?")) onClose();
  };
  return (
    <dialog
      ref={ref}
      className={drawer ? "modal drawer" : "modal"}
      aria-labelledby="dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      <div className="modal-heading">
        <div>
          <div className="eyebrow">NEXALIS WORKSPACE · LOCAL DEMO</div>
          <h2 id="dialog-title">{title}</h2>
        </div>
        <button
          aria-label="Close dialog"
          className="icon-button"
          onClick={requestClose}
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Alert({
  children,
  success = false,
}: {
  children: ReactNode;
  success?: boolean;
}) {
  return (
    <div
      className={`alert ${success ? "success" : ""}`}
      role={success ? "status" : "alert"}
    >
      {success ? <Check size={16} /> : <AlertCircle size={16} />}
      <div>{children}</div>
    </div>
  );
}
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((row) =>
      row.map((v) => '"' + String(v).replaceAll('"', '""') + '"').join(","),
    )
    .join("\r\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
export function Stats({
  items,
}: {
  items: {
    label: string;
    value: string | number;
    detail: string;
    kind?: string;
  }[];
}) {
  return (
    <div className="stats-grid">
      {items.map((i) => (
        <div className={`stat-card ${i.kind ?? ""}`} key={i.label}>
          <div>
            <span>{i.label}</span>
            <FolderKanban size={17} />
          </div>
          <strong>{i.value}</strong>
          <small>{i.detail}</small>
        </div>
      ))}
    </div>
  );
}
