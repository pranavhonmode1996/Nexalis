import type { Project, Task, User } from "./types";
export const isAdmin = (u?: User | null) =>
  Boolean(u?.active && u.role === "Administrator");
export const canAccess = (u: User | null | undefined, p: Project) =>
  Boolean(u?.active && (isAdmin(u) || p.memberIds.includes(u.id)));
export const canManage = (u: User | null | undefined, p: Project) =>
  canAccess(u, p) &&
  Boolean(
    isAdmin(u) || (u?.role === "Project Manager" && p.managerId === u.id),
  );
export const canCreateTask = (u: User | null | undefined, p: Project) =>
  canAccess(u, p) && p.status !== "Archived" && u?.role !== "Viewer";
export const canEditTask = (u: User | null | undefined, p: Project, t: Task) =>
  canCreateTask(u, p) && (canManage(u, p) || t.assigneeId === u?.id);
export const canComment = canCreateTask;
export const assignableMembers = (u: User, p: Project, users: User[]) =>
  users.filter(
    (m) =>
      m.active &&
      p.memberIds.includes(m.id) &&
      (canManage(u, p) || m.id === u.id),
  );
