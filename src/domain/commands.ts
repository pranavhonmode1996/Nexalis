import {
  canAccess,
  canComment,
  canCreateTask,
  canEditTask,
  canManage,
  isAdmin,
} from "./permissions";
import {
  priorities,
  roles,
  statuses,
  WorkspaceError,
  type Command,
  type Snapshot,
  type User,
  type Project,
} from "./types";
import { validCalendarDate } from "./dates";
function requireThat(
  value: unknown,
  code: WorkspaceError["code"],
  message: string,
): asserts value {
  if (!value) throw new WorkspaceError(code, message);
}
function version(actual: number, expected?: number) {
  requireThat(
    actual === expected,
    "conflict",
    "This record changed in another tab. Close and reopen this form to load the latest version, then reapply your changes.",
  );
}
function text(value: string, label: string, max = 5000) {
  requireThat(
    typeof value === "string" && value.trim().length > 0 && value.length <= max,
    "validation",
    `${label} is required and must be under ${max} characters.`,
  );
}
function date(value: string) {
  requireThat(
    !value || validCalendarDate(value),
    "validation",
    "Enter a valid calendar date.",
  );
}
export function applyCommand(
  source: Snapshot,
  actorId: string,
  command: Command,
  now = new Date().toISOString(),
  makeId = () => crypto.randomUUID(),
): Snapshot {
  const s = structuredClone(source);
  const actor = s.users.find((u) => u.id === actorId);
  requireThat(
    actor?.active,
    "session",
    "Your demo session has expired or the account is inactive. Sign in again.",
  );
  const project = (id: string): Project => {
    const p = s.projects.find((p) => p.id === id);
    requireThat(
      p && canAccess(actor, p),
      "permission",
      "You do not have access to this project.",
    );
    return p;
  };
  const activeUser = (id: string): User => {
    const u = s.users.find((u) => u.id === id);
    requireThat(u?.active, "validation", "Choose an active workspace member.");
    return u;
  };
  const activity = (projectId: string, body: string, taskId?: string) =>
    s.activities.unshift({
      id: makeId(),
      projectId,
      taskId,
      authorId: actor.id,
      body,
      createdAt: now,
    });
  switch (command.kind) {
    case "project.save": {
      const old = command.id ? project(command.id) : undefined;
      requireThat(
        old ? canManage(actor, old) : isAdmin(actor),
        "permission",
        "Only administrators create projects. Assigned managers can edit their projects.",
      );
      if (old) version(old.version, command.expectedVersion);
      const input = command.input;
      text(input.name, "Project name", 180);
      text(input.key, "Project key", 8);
      text(input.description, "Description");
      date(input.dueDate);
      requireThat(
        /^[A-Z][A-Z0-9]{1,7}$/.test(input.key),
        "validation",
        "Project key must be 2–8 uppercase letters or numbers.",
      );
      requireThat(
        !s.projects.some((p) => p.key === input.key && p.id !== old?.id),
        "validation",
        "That project key is already in use.",
      );
      requireThat(
        ["Active", "On Hold", "Archived"].includes(input.status),
        "validation",
        "Choose a valid project status.",
      );
      if (!isAdmin(actor) && old) {
        requireThat(
          input.status === old.status &&
            input.managerId === old.managerId &&
            JSON.stringify(input.memberIds) === JSON.stringify(old.memberIds),
          "permission",
          "Only administrators can change project lifecycle or the assigned project manager. Use membership controls to manage members.",
        );
      }
      const manager = activeUser(input.managerId);
      requireThat(
        manager.role === "Project Manager" || isAdmin(manager),
        "validation",
        "Select an administrator or project manager.",
      );
      requireThat(
        input.memberIds.includes(manager.id),
        "validation",
        "The project manager must belong to the project.",
      );
      requireThat(
        new Set(input.memberIds).size === input.memberIds.length,
        "validation",
        "Duplicate project members.",
      );
      for (const id of input.memberIds)
        if (!old?.memberIds.includes(id)) activeUser(id);
      if (old)
        requireThat(
          old.memberIds.every((id) => input.memberIds.includes(id)),
          "validation",
          "Remove members through the members view so assigned work can be explicitly unassigned.",
        );
      const saved = {
        ...input,
        name: input.name.trim(),
        id: old?.id ?? makeId(),
        version: (old?.version ?? 0) + 1,
      };
      if (old) s.projects[s.projects.indexOf(old)] = saved;
      else s.projects.push(saved);
      activity(
        saved.id,
        old ? "updated project details." : "created the project.",
      );
      break;
    }
    case "task.save": {
      const old = command.id
        ? s.tasks.find((t) => t.id === command.id)
        : undefined;
      requireThat(!command.id || old, "validation", "Task not found.");
      const p = project(old?.projectId ?? command.input.projectId);
      requireThat(
        old ? canEditTask(actor, p, old) : canCreateTask(actor, p),
        "permission",
        "You cannot modify this task. Archived projects are read-only.",
      );
      if (old) version(old.version, command.expectedVersion);
      const input = command.input;
      requireThat(
        input.projectId === p.id,
        "validation",
        "Tasks cannot move between projects.",
      );
      text(input.title, "Task title", 240);
      text(input.description, "Description");
      date(input.dueDate);
      requireThat(
        statuses.includes(input.status) && priorities.includes(input.priority),
        "validation",
        "Select a valid status and priority.",
      );
      if (input.assigneeId)
        requireThat(
          activeUser(input.assigneeId) &&
            p.memberIds.includes(input.assigneeId),
          "validation",
          "Assignee must be an active project member.",
        );
      if (!canManage(actor, p))
        requireThat(
          old
            ? input.assigneeId === old.assigneeId
            : !input.assigneeId || input.assigneeId === actor.id,
          "permission",
          "Members can assign new tasks only to themselves and cannot reassign existing tasks.",
        );
      const saved = {
        ...input,
        title: input.title.trim(),
        id: old?.id ?? makeId(),
        createdAt: old?.createdAt ?? now,
        updatedAt: now,
        version: (old?.version ?? 0) + 1,
      };
      if (old) s.tasks[s.tasks.indexOf(old)] = saved;
      else s.tasks.push(saved);
      activity(
        p.id,
        old ? `updated “${saved.title}”.` : `created “${saved.title}”.`,
        saved.id,
      );
      break;
    }
    case "task.status": {
      const t = s.tasks.find((t) => t.id === command.id);
      requireThat(t, "validation", "Task not found.");
      const p = project(t.projectId);
      requireThat(
        canEditTask(actor, p, t),
        "permission",
        "You cannot change this task. Archived projects are read-only.",
      );
      version(t.version, command.expectedVersion);
      requireThat(
        statuses.includes(command.status),
        "validation",
        "Invalid status.",
      );
      t.status = command.status;
      t.version++;
      t.updatedAt = now;
      activity(p.id, `changed “${t.title}” to ${t.status}.`, t.id);
      break;
    }
    case "comment.add": {
      const t = s.tasks.find((t) => t.id === command.taskId);
      requireThat(t, "validation", "Task not found.");
      const p = project(t.projectId);
      requireThat(
        canComment(actor, p),
        "permission",
        "Comments are unavailable for viewers and archived projects.",
      );
      text(command.body, "Comment", 3000);
      s.comments.push({
        id: makeId(),
        taskId: t.id,
        authorId: actor.id,
        body: command.body.trim(),
        createdAt: now,
      });
      activity(p.id, `commented on “${t.title}”.`, t.id);
      break;
    }
    case "member.add":
    case "member.remove": {
      const p = project(command.projectId);
      requireThat(
        canManage(actor, p) && p.status !== "Archived",
        "permission",
        "Only project managers or administrators can manage active project membership.",
      );
      version(p.version, command.expectedVersion);
      if (command.kind === "member.add") {
        activeUser(command.userId);
        if (!p.memberIds.includes(command.userId))
          p.memberIds.push(command.userId);
        activity(p.id, "added a project member.");
      } else {
        requireThat(
          command.userId !== p.managerId,
          "validation",
          "Assign a different project manager before removing this member.",
        );
        const assigned = s.tasks.filter(
          (t) =>
            t.projectId === p.id &&
            t.assigneeId === command.userId &&
            t.status !== "Done",
        );
        requireThat(
          !assigned.length || command.unassign,
          "validation",
          "Explicitly confirm unassignment of open tasks before removing this member.",
        );
        for (const t of s.tasks.filter(
          (t) => t.projectId === p.id && t.assigneeId === command.userId,
        )) {
          t.assigneeId = "";
          t.version++;
          t.updatedAt = now;
        }
        p.memberIds = p.memberIds.filter((id) => id !== command.userId);
        activity(p.id, "removed a member and unassigned their tasks.");
      }
      p.version++;
      break;
    }
    case "user.save": {
      requireThat(
        isAdmin(actor),
        "permission",
        "Only administrators can manage workspace users and roles.",
      );
      const old = command.id
        ? s.users.find((u) => u.id === command.id)
        : undefined;
      requireThat(!command.id || old, "validation", "Member not found.");
      if (old) version(old.version, command.expectedVersion);
      const input = command.input;
      text(input.name, "Name", 120);
      text(input.email, "Email", 240);
      requireThat(
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email),
        "validation",
        "Enter a valid email address.",
      );
      requireThat(
        roles.includes(input.role),
        "validation",
        "Select a valid role.",
      );
      requireThat(
        !s.users.some(
          (u) =>
            u.id !== old?.id &&
            u.email.toLowerCase() === input.email.toLowerCase(),
        ),
        "validation",
        "Email address is already in use.",
      );
      if (
        old &&
        isAdmin(old) &&
        (!input.active || input.role !== "Administrator")
      )
        requireThat(
          s.users.filter(isAdmin).length > 1,
          "validation",
          "The last active Administrator cannot be deactivated or demoted.",
        );
      if (
        old &&
        (!input.active ||
          (input.role !== "Administrator" && input.role !== "Project Manager"))
      )
        requireThat(
          !s.projects.some(
            (p) => p.managerId === old.id && p.status !== "Archived",
          ),
          "validation",
          "Assign a new manager to active projects before deactivating or changing this manager’s role.",
        );
      const saved = {
        ...input,
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        id: old?.id ?? makeId(),
        version: (old?.version ?? 0) + 1,
      };
      if (old) s.users[s.users.indexOf(old)] = saved;
      else s.users.push(saved);
      if (!saved.active)
        for (const t of s.tasks.filter((t) => t.assigneeId === saved.id)) {
          t.assigneeId = "";
          t.version++;
          t.updatedAt = now;
        }
      break;
    }
    case "profile.save": {
      version(actor.version, command.expectedVersion);
      text(command.name, "Full name", 120);
      actor.name = command.name.trim();
      actor.title = command.title.trim();
      actor.version++;
      break;
    }
    case "preferences.save":
      s.preferences[actor.id] = command.input;
      break;
    case "workspace.save":
      requireThat(
        isAdmin(actor),
        "permission",
        "Only administrators can manage workspace settings.",
      );
      version(s.workspace.version, command.expectedVersion);
      text(command.name, "Workspace name", 180);
      text(command.region, "Region", 180);
      s.workspace = {
        name: command.name.trim(),
        region: command.region.trim(),
        timezone: "Asia/Dubai",
        version: s.workspace.version + 1,
      };
      break;
  }
  s.revision++;
  return s;
}
