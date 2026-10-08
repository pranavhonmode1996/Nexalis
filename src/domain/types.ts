export const roles = [
  "Administrator",
  "Project Manager",
  "Team Member",
  "Viewer",
] as const;
export type Role = (typeof roles)[number];
export const statuses = [
  "To Do",
  "In Progress",
  "In Review",
  "Done",
  "Blocked",
] as const;
export type Status = (typeof statuses)[number];
export const priorities = ["Low", "Medium", "High", "Critical"] as const;
export type Priority = (typeof priorities)[number];
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  title: string;
  version: number;
}
export interface Project {
  id: string;
  key: string;
  name: string;
  description: string;
  location: string;
  managerId: string;
  memberIds: string[];
  status: "Active" | "On Hold" | "Archived";
  dueDate: string;
  version: number;
}
export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assigneeId: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}
export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  body: string;
  createdAt: string;
}
export interface Activity {
  id: string;
  projectId: string;
  taskId?: string;
  authorId: string;
  body: string;
  createdAt: string;
}
export interface Preferences {
  emailNotifications: boolean;
  compact: boolean;
}
export interface Workspace {
  name: string;
  region: string;
  timezone: "Asia/Dubai";
  version: number;
}
export interface Snapshot {
  schema: 1;
  revision: number;
  users: User[];
  projects: Project[];
  tasks: Task[];
  comments: Comment[];
  activities: Activity[];
  preferences: Record<string, Preferences>;
  workspace: Workspace;
}
export type ProjectInput = Omit<Project, "id" | "version">;
export type TaskInput = Omit<
  Task,
  "id" | "version" | "createdAt" | "updatedAt"
>;
export type Command =
  | {
      kind: "project.save";
      id?: string;
      expectedVersion?: number;
      input: ProjectInput;
    }
  | {
      kind: "task.save";
      id?: string;
      expectedVersion?: number;
      input: TaskInput;
    }
  | { kind: "task.status"; id: string; expectedVersion: number; status: Status }
  | { kind: "comment.add"; taskId: string; body: string }
  | {
      kind: "member.remove";
      projectId: string;
      userId: string;
      expectedVersion: number;
      unassign: boolean;
    }
  | {
      kind: "member.add";
      projectId: string;
      userId: string;
      expectedVersion: number;
    }
  | {
      kind: "user.save";
      id?: string;
      expectedVersion?: number;
      input: Omit<User, "id" | "version">;
    }
  | {
      kind: "profile.save";
      name: string;
      title: string;
      expectedVersion: number;
    }
  | { kind: "preferences.save"; input: Preferences }
  | {
      kind: "workspace.save";
      expectedVersion: number;
      name: string;
      region: string;
    };
export class WorkspaceError extends Error {
  constructor(
    public code:
      | "permission"
      | "conflict"
      | "validation"
      | "network"
      | "session"
      | "configuration",
    message: string,
  ) {
    super(message);
    this.name = "WorkspaceError";
  }
}
