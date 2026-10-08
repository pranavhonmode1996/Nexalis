# Design system

Source: Nexalis Workspace Stitch project `17169495214196134972`, design system `assets/296371bb1df24dab9d42868e0b2bff9b`. The complete retrieved specification is preserved in `design-references/approved-design-system.md` and the manifest. All 16 W01–W16 desktop screenshots were inspected. Four hidden earlier alternatives were also inspected.

## Foundations

CSS tokens live in `src/app/globals.css`:

| Token             | Value     | Use                                              |
| ----------------- | --------- | ------------------------------------------------ |
| Structural navy   | `#0f172a` | Sidebar                                          |
| Secondary navy    | `#1e293b` | Account-entry panel and context                  |
| Primary           | `#00685f` | Retrieved theme primary; actions and active tabs |
| Primary container | `#008378` | Selected sidebar links and hover                 |
| Canvas            | `#f8f9ff` | Retrieved theme background                       |
| Pale surface      | `#eff4ff` | Filters, context and board columns               |
| Surface           | `#ffffff` | Cards, tables and dialogs                        |
| Border            | `#e2e8f0` | Low-contrast structural boundaries               |
| Body              | `#0b1c30` | Main text                                        |
| Secondary text    | `#596b82` | Adjusted for readable contrast on pale surfaces  |

The source specification also describes `#0d9488` as its brand accent; the exported named primary is `#00685f`, used by the inspected screenshot actions. Statuses use text plus slate, blue, amber, emerald or crimson tints. Priority is always named. Inter 400/500/600/700 is hosted locally in `public/fonts/` with its OFL license. Numerical data uses tabular alignment where appropriate; IDs use the system monospace stack because a separate JetBrains Mono asset was not supplied.

Spacing follows the source's 4px base, 12–16px card padding and 24px desktop margins. Controls use 4–6px rounding and panels 6–8px. Shadows are subtle and borders carry most hierarchy. Page titles use 24–26px with compact 11–13px workflow text, adapting the source's dense presentation to functioning controls.

## Shared components

- `ui.tsx`: headings, panels, status and priority badges, initial avatars, progress, empty/loading/error states, native modal dialogs, unsaved-change protection, CSV export and statistic cards.
- `shell.tsx`: navigation, responsive sidebar, breadcrumb context, GST clock, persona selector, workspace search, recent activity and global task creation.
- `workspace-forms.tsx`: reusable project modal, task drawer and member form.
- `task-views.tsx`: task table, filters, sort, pagination, contained Kanban board, task cards, details, comments and audit activity.
- `project-views.tsx`: project cards, portfolio directory, shared tabs and project overview.

Native `<dialog>` provides focus containment, Escape support and backdrop semantics. The opener receives focus when a dialog closes. Dirty forms require a browser confirmation before discard and register `beforeunload` protection. Browser confirmation is intentionally used for unsaved navigation so it also works during native page transitions. The mobile navigation has focus cycling and Escape support. All icon-only controls have accessible names. Reduced motion disables animations.

## Responsive rules

At 1600px and above the sidebar is 260px; ordinary desktop uses a 240px or 205px sidebar so the data canvas has sufficient room. Tablet (768–1023px) uses a 64px icon rail. Below 768px navigation becomes an off-canvas drawer and content stacks. Tables scroll within their containers. The board uses horizontally scrollable columns with an accessible status selector on every editable card. Page-wide overflow is checked in the browser suite. Task drawers fit `100dvh`; other dialogs fit within the viewport. Mobile form inputs use readable sizes, and content wraps long names and titles.

## Reference availability and adaptations

The Stitch screenshot downloads worked. All HTML export URLs redirected to Google account sign-in rather than returning layout code; those sign-in documents were discarded. No separate company logo, photographs, avatar images or attachment assets were provided through the available metadata. The application therefore uses a text brand with a simple geometric mark, initial avatars, and a CSS operational graphic at account entry. These are documented substitutions, not exact approved asset reproductions.

The screens contain SCADA telemetry, hardware certificates, digital signatures, security clearance tiers, engineering document uploads, time logging, emergency access, licensing and email verification controls. No backend contracts or requirements exist for those systems. Their operational chrome informs the visual hierarchy, but simulated security or service claims are not exposed as working product controls. Actual project/task behavior follows the supplied product requirements. No fabricated historical analytics are shown; reports calculate current local data.

There are no separately retrieved mobile/tablet references. Those layouts are responsive adaptations. Screenshot review confirms the shared navy/teal identity, pale workflow surfaces, compact tables, card hierarchy and right-side task composer; exact pixel parity and original photography remain unverified. Native form controls are used to preserve semantic behavior.
