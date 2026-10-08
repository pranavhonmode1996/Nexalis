import { test } from "node:test";
import assert from "node:assert/strict";
import { applyCommand } from "../src/domain/commands";
import {
  canAccess,
  canCreateTask,
  canEditTask,
  canManage,
  assignableMembers,
} from "../src/domain/permissions";
import {
  calendarDate,
  dubaiToday,
  validCalendarDate,
} from "../src/domain/dates";
import { seed } from "../src/domain/seed";
import {
  WorkspaceError,
  type Command,
  type TaskInput,
  type Snapshot,
} from "../src/domain/types";
const taskInput: TaskInput = {
  projectId: "supplier-review",
  title: "New engineering deliverable",
  description: "Review specifications and verify acceptance criteria.",
  status: "To Do",
  priority: "High",
  assigneeId: "fatima",
  dueDate: "2026-11-01",
};
function execute(s: Snapshot, actor: string, c: Command) {
  let index = 0;
  return applyCommand(
    s,
    actor,
    c,
    "2026-10-08T08:00:00Z",
    () => `new-${++index}`,
  );
}
function rejects(
  actor: string,
  c: Command,
  code: WorkspaceError["code"] = "permission",
  s = seed(),
) {
  assert.throws(
    () => execute(s, actor, c),
    (e: unknown) => e instanceof WorkspaceError && e.code === code,
  );
}
test("Administrator accesses every project; ordinary users require membership", () => {
  const s = seed();
  const p = s.projects[1];
  assert.equal(canAccess(s.users[0], p), true);
  assert.equal(canAccess(s.users[2], p), false);
  assert.equal(canAccess(s.users[3], p), false);
});
test("Manager rights apply to assigned projects and otherwise use member rights", () => {
  const s = seed();
  const u = s.users[1],
    p = s.projects[0];
  assert.equal(canManage(u, p), true);
  p.managerId = "tariq";
  assert.equal(canManage(u, p), false);
  const t = s.tasks[0];
  assert.equal(canEditTask(u, p, t), false);
  t.assigneeId = u.id;
  assert.equal(canEditTask(u, p, t), true);
});
test("Inactive users never access projects", () => {
  const s = seed();
  s.users[0].active = false;
  assert.equal(canAccess(s.users[0], s.projects[0]), false);
});
test("Viewer cannot create, change status, edit task or comment", () => {
  rejects("omar", { kind: "task.save", input: taskInput });
  rejects("omar", {
    kind: "task.status",
    id: "task-101",
    expectedVersion: 1,
    status: "Done",
  });
  rejects("omar", {
    kind: "task.save",
    id: "task-101",
    expectedVersion: 1,
    input: { ...taskInput, assigneeId: "tariq" },
  });
  rejects("omar", {
    kind: "comment.add",
    taskId: "task-101",
    body: "No write access",
  });
});
test("Administrator creates projects and manager cannot create workspace projects", () => {
  const input = { ...seed().projects[0], key: "NEW", name: "New project" };
  assert.equal(
    execute(seed(), "tariq", { kind: "project.save", input }).projects.length,
    5,
  );
  rejects("sarah", { kind: "project.save", input });
});
test("Assigned manager edits scope but cannot alter lifecycle or workspace ownership", () => {
  const p = seed().projects[0];
  const updated = execute(seed(), "sarah", {
    kind: "project.save",
    id: p.id,
    expectedVersion: 1,
    input: { ...p, name: "Updated scope" },
  });
  assert.equal(updated.projects[0].name, "Updated scope");
  rejects("sarah", {
    kind: "project.save",
    id: p.id,
    expectedVersion: 1,
    input: { ...p, status: "Archived" },
  });
  rejects("sarah", {
    kind: "project.save",
    id: p.id,
    expectedVersion: 1,
    input: { ...p, managerId: "tariq" },
  });
});
test("Team member edits only assigned tasks", () => {
  const s = seed();
  assert.equal(canEditTask(s.users[2], s.projects[0], s.tasks[1]), true);
  assert.equal(canEditTask(s.users[2], s.projects[0], s.tasks[0]), false);
  rejects("fatima", {
    kind: "task.status",
    id: "task-101",
    expectedVersion: 1,
    status: "Done",
  });
  assert.equal(
    execute(s, "fatima", {
      kind: "task.status",
      id: "task-102",
      expectedVersion: 1,
      status: "Done",
    }).tasks[1].status,
    "Done",
  );
});
test("Team member creates self-assigned or unassigned work but not work for others", () => {
  for (const assigneeId of ["fatima", ""])
    assert.equal(
      execute(seed(), "fatima", {
        kind: "task.save",
        input: { ...taskInput, assigneeId },
      }).tasks.length,
      16,
    );
  rejects("fatima", {
    kind: "task.save",
    input: { ...taskInput, assigneeId: "zayed" },
  });
});
test("Members cannot reassign an existing task even to unassigned", () => {
  rejects("fatima", {
    kind: "task.save",
    id: "task-102",
    expectedVersion: 1,
    input: { ...taskInput, assigneeId: "" },
  });
});
test("Only active project members are assignable", () => {
  const s = seed();
  assert.deepEqual(
    assignableMembers(s.users[2], s.projects[0], s.users).map((u) => u.id),
    ["fatima"],
  );
  rejects(
    "tariq",
    { kind: "task.save", input: { ...taskInput, assigneeId: "noora" } },
    "validation",
  );
  rejects(
    "tariq",
    {
      kind: "task.save",
      input: { ...taskInput, projectId: "office-hse", assigneeId: "fatima" },
    },
    "validation",
  );
});
test("Archived projects block task mutations, comments and membership changes", () => {
  const s = seed(),
    p = s.projects[3];
  assert.equal(canCreateTask(s.users[0], p), false);
  rejects("tariq", {
    kind: "task.save",
    input: { ...taskInput, projectId: p.id, assigneeId: "" },
  });
  rejects("tariq", {
    kind: "task.status",
    id: "task-115",
    expectedVersion: 1,
    status: "To Do",
  });
  rejects("tariq", {
    kind: "comment.add",
    taskId: "task-115",
    body: "Not allowed",
  });
  rejects("tariq", {
    kind: "member.add",
    projectId: p.id,
    userId: "zayed",
    expectedVersion: 1,
  });
});
test("Direct mutation of inaccessible project is rejected", () => {
  rejects("fatima", {
    kind: "task.save",
    input: { ...taskInput, projectId: "office-hse", assigneeId: "" },
  });
});
test("Stale task edits conflict and source snapshot stays unchanged", () => {
  const s = seed();
  const next = execute(s, "tariq", {
    kind: "task.status",
    id: "task-101",
    expectedVersion: 1,
    status: "Done",
  });
  rejects(
    "tariq",
    { kind: "task.save", id: "task-101", expectedVersion: 1, input: taskInput },
    "conflict",
    next,
  );
  assert.equal(s.tasks[0].version, 1);
  assert.equal(next.tasks[0].status, "Done");
});
test("Status change increments record version and records activity", () => {
  const s = execute(seed(), "sarah", {
    kind: "task.status",
    id: "task-101",
    expectedVersion: 1,
    status: "Done",
  });
  assert.equal(s.tasks[0].version, 2);
  assert.equal(s.activities[0].taskId, "task-101");
  assert.match(s.activities[0].body, /Done/);
});
test("Comments retain actor identity and UTC timestamps", () => {
  const s = execute(seed(), "fatima", {
    kind: "comment.add",
    taskId: "task-101",
    body: "  Review complete.  ",
  });
  const c = s.comments.at(-1)!;
  assert.equal(c.authorId, "fatima");
  assert.equal(c.body, "Review complete.");
  assert.equal(c.createdAt, "2026-10-08T08:00:00Z");
});
test("Member removal requires explicit unassignment and clears every assignment", () => {
  const command: Command = {
    kind: "member.remove",
    projectId: "supplier-review",
    userId: "fatima",
    expectedVersion: 1,
    unassign: false,
  };
  rejects("sarah", command, "validation");
  const s = execute(seed(), "sarah", { ...command, unassign: true });
  assert.equal(s.projects[0].memberIds.includes("fatima"), false);
  assert.equal(
    s.tasks.some(
      (t) => t.projectId === "supplier-review" && t.assigneeId === "fatima",
    ),
    false,
  );
});
test("Current project manager cannot be removed", () => {
  rejects(
    "tariq",
    {
      kind: "member.remove",
      projectId: "supplier-review",
      userId: "sarah",
      expectedVersion: 1,
      unassign: true,
    },
    "validation",
  );
});
test("Manager can add members only on assigned projects", () => {
  const s = seed();
  s.projects[0].managerId = "tariq";
  rejects(
    "sarah",
    {
      kind: "member.add",
      projectId: "supplier-review",
      userId: "noora",
      expectedVersion: 1,
    },
    "permission",
    s,
  );
});
test("Last active Administrator cannot be demoted or deactivated", () => {
  const u = seed().users[0];
  for (const input of [
    { ...u, role: "Viewer" as const },
    { ...u, active: false },
  ])
    rejects(
      "tariq",
      { kind: "user.save", id: u.id, expectedVersion: 1, input },
      "validation",
    );
});
test("Manager cannot change workspace users, roles or settings", () => {
  rejects("sarah", {
    kind: "user.save",
    id: "fatima",
    expectedVersion: 1,
    input: { ...seed().users[2], role: "Administrator" },
  });
  rejects("sarah", {
    kind: "workspace.save",
    expectedVersion: 1,
    name: "Changed",
    region: "UAE",
  });
});
test("Deactivated members lose access and assignments", () => {
  const s = execute(seed(), "tariq", {
    kind: "user.save",
    id: "fatima",
    expectedVersion: 1,
    input: { ...seed().users[2], active: false },
  });
  assert.equal(canAccess(s.users[2], s.projects[0]), false);
  assert.equal(
    s.tasks.some((t) => t.assigneeId === "fatima"),
    false,
  );
  rejects(
    "fatima",
    { kind: "comment.add", taskId: "task-101", body: "No session" },
    "session",
    s,
  );
});
test("Inactive existing membership does not block project editing", () => {
  let s = execute(seed(), "tariq", {
    kind: "user.save",
    id: "fatima",
    expectedVersion: 1,
    input: { ...seed().users[2], active: false },
  });
  s = execute(s, "tariq", {
    kind: "project.save",
    id: s.projects[0].id,
    expectedVersion: 1,
    input: { ...s.projects[0], name: "Updated" },
  });
  assert.equal(s.projects[0].name, "Updated");
});
test("Task title, description and calendar dates are validated", () => {
  for (const input of [
    { ...taskInput, title: " " },
    { ...taskInput, description: "" },
    { ...taskInput, dueDate: "2026-02-30" },
  ])
    rejects("tariq", { kind: "task.save", input }, "validation");
});
test("Due dates remain on their calendar day; GST dates cross UTC midnight correctly", () => {
  assert.equal(calendarDate("2026-10-08"), "08 Oct 2026");
  assert.equal(dubaiToday(new Date("2026-10-07T21:00:00Z")), "2026-10-08");
  assert.equal(validCalendarDate("2028-02-29"), true);
  assert.equal(validCalendarDate("2026-02-29"), false);
});
