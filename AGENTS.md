<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Nexalis implementation

- Preserve the approved Nexalis Stitch references; do not modify the Stitch project.
- Use npm and the existing Next.js App Router architecture.
- See `docs/design-system.md`, `docs/screen-map.md`, `docs/roles-and-permissions.md`, `docs/backend-integration.md`, and `docs/implementation-progress.md`.
- Demo data must stay explicitly labelled. Never silently load demo data in live mode.
- Keep permission rules in `src/domain/permissions.ts` and mutation invariants in `src/domain/commands.ts`. Real authorization must also be enforced by a trusted backend.
- Run typecheck, lint, domain tests, production build and the relevant browser checks. Never claim checks that did not run.
