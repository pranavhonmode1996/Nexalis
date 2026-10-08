import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function login(page: Page, persona = "tariq") {
  await page.goto("/login");
  await page.getByLabel("Demo workspace identity").selectOption(persona);
  await page.getByRole("button", { name: "Enter demo workspace" }).click();
  await expect(
    page.getByRole("heading", { name: "Executive Operations Cockpit" }),
  ).toBeVisible();
}
async function expectAccessible(page: Page) {
  const scan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    scan.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([]);
}
test("Administrator creates a project and task, comments and sees consistent progress", async ({
  page,
}) => {
  await login(page);
  await page.goto("/projects");
  await page
    .getByRole("button", { name: "Create Project", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Project name").fill("Pipeline Integrity Upgrade");
  await dialog.getByLabel("Project key").fill("PIU");
  await dialog
    .getByLabel("Engineering scope")
    .fill("Verify pipeline integrity and engineering acceptance criteria.");
  await dialog
    .getByRole("button", { name: "Create Project", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await page
    .getByRole("heading", { name: "Pipeline Integrity Upgrade" })
    .click();
  await expect(page.locator("main h1")).toHaveText(
    "Pipeline Integrity Upgrade",
  );
  await page
    .locator("main")
    .getByRole("button", { name: "Create Task", exact: true })
    .click();
  await dialog.getByLabel("Task title").fill("Review pressure test results");
  await dialog
    .getByLabel("Description")
    .fill("Verify all pressure test records.");
  await dialog.getByLabel("Assignee").selectOption("sarah");
  await dialog.getByLabel("Due date").fill("2026-11-20");
  await dialog
    .getByRole("button", { name: "Create Task", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await page
    .getByRole("navigation", { name: "Project views" })
    .getByRole("link", { name: "Task List" })
    .click();
  await page
    .getByRole("link", { name: /Review pressure test results/ })
    .click();
  await page.getByLabel("Task status", { exact: true }).selectOption("Done");
  await expect(page.getByRole("status")).toContainText("Changes saved");
  await page
    .getByLabel("Add a comment")
    .fill("Pressure test records verified.");
  await page.getByRole("button", { name: "Post Comment" }).click();
  await expect(
    page.locator(".comment").getByText("Pressure test records verified."),
  ).toBeVisible();
  await expect(page.getByLabel("Add a comment")).toHaveValue("");
  await page.getByRole("link", { name: "Back to project tasks" }).click();
  await expect(
    page.getByLabel("Status for Review pressure test results"),
  ).toHaveValue("Done");
  await page.goto("/reports");
  await page
    .getByLabel("Report project scope")
    .selectOption({ label: "Pipeline Integrity Upgrade" });
  await expect(page.locator(".stat-card").first()).toContainText("100%");
});
test("Viewer reads tasks, cannot mutate and is denied workspace settings", async ({
  page,
}) => {
  await login(page, "omar");
  await expect(
    page.getByRole("button", { name: "Create Task", exact: true }),
  ).toHaveCount(0);
  await page.goto("/projects/supplier-review/tasks/task-101");
  await expect(page.getByRole("button", { name: "Edit Task" })).toHaveCount(0);
  await expect(page.getByLabel("Add a comment")).toHaveCount(0);
  await page.goto("/settings/workspace");
  await expect(
    page.getByRole("heading", {
      name: "Workspace settings require Administrator access",
    }),
  ).toBeVisible();
  await page.goto("/projects/office-hse");
  await expect(
    page.getByRole("heading", {
      name: "Access Restricted — Project Workspace",
    }),
  ).toBeVisible();
});
test("Member edits assigned work and manager actions remain scoped", async ({
  page,
}) => {
  await login(page, "fatima");
  await page.goto("/projects/supplier-review/tasks/task-102");
  await expect(page.getByRole("button", { name: "Edit Task" })).toBeVisible();
  await page.goto("/projects/supplier-review/tasks/task-101");
  await expect(page.getByRole("button", { name: "Edit Task" })).toHaveCount(0);
  await page.goto("/projects/supplier-review/members");
  await expect(
    page.getByRole("button", { name: "Add Member", exact: true }),
  ).toHaveCount(0);
  await page.getByLabel("Demo persona").selectOption("sarah");
  await expect(
    page.getByRole("button", { name: "Add Member", exact: true }),
  ).toBeVisible();
  await page.goto("/team");
  await expect(
    page.getByRole("button", { name: "Add Demo Member" }),
  ).toHaveCount(0);
  await page.goto("/projects");
  await expect(
    page.getByRole("button", { name: "Create Project", exact: true }),
  ).toHaveCount(0);
});
test("Failed requests preserve status and retry succeeds; archived project is read-only", async ({
  page,
}) => {
  await login(page);
  await page.goto("/system-states");
  await page.getByRole("button", { name: "Fail Next Mutation" }).click();
  await page.goto("/projects/supplier-review/tasks/task-101");
  await page.getByLabel("Task status", { exact: true }).selectOption("Done");
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "Simulated request failure",
  );
  await expect(page.getByLabel("Task status", { exact: true })).toHaveValue(
    "In Review",
  );
  await page.getByLabel("Task status", { exact: true }).selectOption("Done");
  await expect(page.getByLabel("Task status", { exact: true })).toHaveValue(
    "Done",
  );
  await page.goto("/projects/badi-field/board");
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "Archived project",
  );
  await expect(
    page
      .locator("main")
      .getByRole("button", { name: "Create Task", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator("main .task-card select")).toHaveCount(0);
});
test("Concurrent task forms receive a conflict instead of overwriting", async ({
  page,
  context,
}) => {
  await login(page);
  const other = await context.newPage();
  await login(other);
  for (const p of [page, other]) {
    await p.goto("/projects/supplier-review/tasks/task-101");
    await p.getByRole("button", { name: "Edit Task" }).click();
  }
  await page
    .getByRole("dialog")
    .getByLabel("Task title")
    .fill("Updated by the first editor");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Save Changes" })
    .click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await other
    .getByRole("dialog")
    .getByLabel("Task title")
    .fill("Stale second edit");
  await other
    .getByRole("dialog")
    .getByRole("button", { name: "Save Changes" })
    .click();
  await expect(other.getByRole("dialog").getByRole("alert")).toContainText(
    "record changed in another tab",
  );
  await other.close();
});
test("Unsaved draft warns, dialog restores focus, and expiry clears session", async ({
  page,
}) => {
  await login(page);
  await page.goto("/system-states");
  const trigger = page.getByRole("button", { name: "Open Draft" });
  await trigger.click();
  await page.getByLabel("Draft text").fill("Unsaved changes");
  page.once("dialog", (d) => d.dismiss());
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeVisible();
  page.once("dialog", (d) => d.accept());
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page.getByRole("button", { name: "Expire Demo Session" }).click();
  await expect(
    page.getByRole("heading", { name: "Session unavailable" }),
  ).toBeVisible();
});
test("All routes render without browser errors, desktop screenshots and accessibility scan", async ({
  page,
}) => {
  const audits: unknown[] = [];
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await login(page);
  for (const route of [
    "/dashboard",
    "/projects",
    "/projects/supplier-review",
    "/projects/supplier-review/board",
    "/projects/supplier-review/tasks",
    "/projects/supplier-review/tasks/task-101",
    "/my-tasks",
    "/team",
    "/projects/supplier-review/members",
    "/reports",
    "/settings/account",
    "/settings/workspace",
    "/system-states",
  ]) {
    await page.goto(route);
    await expect(page.locator("main h1")).toBeVisible();
    await page.screenshot({
      path: `test-results/screenshots/desktop-${route.replaceAll("/", "-")}.png`,
      fullPage: true,
    });
    const scan = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    audits.push(
      ...scan.violations.map((v) => ({
        route,
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    );
  }
  await page.goto("/dashboard");
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    audit.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([]);
  expect(audits).toEqual([]);
  expect(errors).toEqual([]);
});
test("Mobile pages contain overflow and navigation is keyboard accessible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  for (const route of [
    "/dashboard",
    "/projects",
    "/projects/supplier-review/board",
    "/projects/supplier-review/tasks",
    "/projects/supplier-review/tasks/task-101",
    "/team",
    "/settings/account",
  ]) {
    await page.goto(route);
    await expect(page.locator("main h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/screenshots/mobile-${route.replaceAll("/", "-")}.png`,
      fullPage: true,
    });
  }
  const button = page.getByRole("button", {
    name: "Open navigation",
    exact: true,
  });
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("complementary", { name: "Workspace navigation" }),
  ).toBeInViewport();
  await page
    .getByRole("button", { name: "Close navigation", exact: true })
    .last()
    .click();
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    audit.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([]);
});

test("Administrator manages members and last Administrator remains protected", async ({
  page,
}) => {
  await login(page);
  await page.goto("/projects/supplier-review/members");
  await page
    .getByRole("button", { name: "Remove Fatima Al-Zaabi", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("button", { name: "Remove Member", exact: true }),
  ).toBeDisabled();
  await dialog.getByRole("checkbox").check();
  await dialog
    .getByRole("button", { name: "Remove Member", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await expect(page.locator("tbody").getByText("Fatima Al-Zaabi")).toHaveCount(
    0,
  );
  await page.goto("/projects/supplier-review/tasks/task-102");
  await expect(page.locator(".detail-list")).toContainText("Unassigned");
  await page.goto("/team");
  await page
    .getByRole("button", { name: "Edit Tariq Al-Hashimi", exact: true })
    .click();
  await dialog.getByLabel("Workspace role").selectOption("Viewer");
  await dialog.getByRole("button", { name: "Save Member" }).click();
  await expect(dialog.getByRole("alert")).toContainText(
    "last active Administrator",
  );
});

test("Board drag and status alternative update the list; filters reset pagination", async ({
  page,
}) => {
  await login(page);
  await page.goto("/projects/supplier-review/tasks");
  await page.getByRole("button", { name: "Next page", exact: true }).click();
  await expect(page.locator(".pagination")).toContainText("Page 2 of 2");
  await page.getByLabel("Filter task priority").selectOption("Critical");
  await expect(page.locator(".pagination")).toContainText("Page 1 of 1");
  await page.getByLabel("Search tasks").fill("unmatched-value");
  await expect(
    page.getByRole("heading", { name: "No matching tasks" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset filters" }).click();
  await expect(page.locator(".pagination")).toContainText("Page 1 of 2");
  await page.goto("/projects/supplier-review/board");
  const title = "Calibration Curves for Coriolis Mass Flow Meters";
  await page
    .locator(".task-card")
    .filter({ hasText: title })
    .dragTo(page.locator(".column-done .column-heading"));
  await expect(
    page.locator(".column-done").getByRole("link", { name: title }),
  ).toBeVisible();
  await page
    .getByLabel("Status for Welder Performance Qualification Records")
    .selectOption("In Review");
  await expect(
    page
      .locator(".column-in-review")
      .getByRole("link", { name: "Welder Performance Qualification Records" }),
  ).toBeVisible();
  await page.goto("/projects/supplier-review/tasks");
  await page.getByLabel("Search tasks").fill("Calibration Curves");
  await expect(page.getByLabel(`Status for ${title}`)).toHaveValue("Done");
});

test("Permission loss updates direct access and account deactivation clears session", async ({
  page,
  context,
}) => {
  await login(page, "fatima");
  await page.goto("/projects/supplier-review/tasks/task-102");
  const admin = await context.newPage();
  await login(admin);
  await admin.goto("/projects/supplier-review/members");
  await admin.getByRole("button", { name: "Remove Fatima Al-Zaabi" }).click();
  await admin.getByRole("dialog").getByRole("checkbox").check();
  await admin
    .getByRole("dialog")
    .getByRole("button", { name: "Remove Member", exact: true })
    .click();
  await expect(admin.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Access Restricted — Project Workspace",
    }),
  ).toBeVisible();
  await admin.goto("/team");
  await admin.getByRole("button", { name: "Edit Fatima Al-Zaabi" }).click();
  await admin
    .getByRole("dialog")
    .getByLabel("Active workspace member")
    .uncheck();
  await admin
    .getByRole("dialog")
    .getByRole("button", { name: "Save Member" })
    .click();
  await expect(admin.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Sign in to Nexalis Workspace" }),
  ).toBeVisible();
  await expect(
    page.getByText("Your account access was revoked.", { exact: false }),
  ).toBeVisible();
  await admin.close();
});

test("Account and workspace settings persist and exports download", async ({
  page,
}) => {
  await login(page);
  await page.goto("/settings/account");
  await page
    .getByLabel("Full name", { exact: true })
    .fill("Tariq Al-Hashimi — Operations");
  await page.getByRole("button", { name: "Save Profile" }).click();
  await expect(page.getByText("Profile saved", { exact: true })).toBeVisible();
  await page.getByRole("switch", { name: /Compact workspace density/ }).check();
  await page.getByRole("button", { name: "Save Preferences" }).click();
  await expect(
    page.getByText("Preferences saved", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Full name", { exact: true })).toHaveValue(
    "Tariq Al-Hashimi — Operations",
  );
  await expect(
    page.getByRole("switch", { name: /Compact workspace density/ }),
  ).toBeChecked();
  await page.goto("/settings/workspace");
  await page.getByLabel("Workspace name").fill("Nexalis UAE Operations");
  await page.getByRole("button", { name: "Save Workspace" }).click();
  await expect(
    page.getByText("Workspace settings saved", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Workspace name")).toHaveValue(
    "Nexalis UAE Operations",
  );
  await page.goto("/reports");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Report" }).click();
  expect((await download).suggestedFilename()).toBe(
    "nexalis-delivery-report.csv",
  );
});

test("Account entry, project modal and task drawer fit desktop and mobile and pass accessibility", async ({
  page,
}) => {
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { name: "Sign in to Nexalis Workspace" }),
  ).toBeVisible();
  await expectAccessible(page);
  await page.screenshot({
    path: "test-results/screenshots/desktop-login.png",
    fullPage: true,
  });
  await login(page);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.goto("/projects");
    await page
      .getByRole("button", { name: "Create Project", exact: true })
      .click();
    await expectAccessible(page);
    await page.screenshot({
      path: `test-results/screenshots/project-modal-${width}.png`,
      fullPage: true,
    });
    const bounds = await page.getByRole("dialog").boundingBox();
    expect(bounds!.width).toBeLessThanOrEqual(width);
    await page.keyboard.press("Escape");
    await page.goto("/projects/supplier-review");
    await page
      .locator("main")
      .getByRole("button", { name: "Create Task", exact: true })
      .click();
    await expectAccessible(page);
    await page.screenshot({
      path: `test-results/screenshots/task-drawer-${width}.png`,
      fullPage: true,
    });
    await page.keyboard.press("Escape");
  }
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.goto("/dashboard");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expectAccessible(page);
  await page.screenshot({
    path: "test-results/screenshots/tablet-dashboard.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 720, height: 1000 });
  await page.evaluate(() => {
    const sizes = Array.from(
      document.querySelectorAll<HTMLElement>("body, body *"),
    )
      .filter((e) => e instanceof HTMLElement)
      .map((e) => ({ e, size: parseFloat(getComputedStyle(e).fontSize) }));
    for (const { e, size } of sizes) e.style.fontSize = `${size * 2}px`;
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
