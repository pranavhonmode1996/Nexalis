# Nexalis Workspace

Next.js App Router + TypeScript frontend for Nexalis International Oil & Gas, UAE, based on Stitch project **17169495214196134972**. The starting repository contained only an empty `a.txt`; there was no application, backend, package manager configuration, or Firebase contract to preserve.

## Run locally

Node.js 22+ and npm are recommended. Dependencies are locked in `package-lock.json`.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000/login and choose a synthetic persona. Changes persist in local browser storage; sessions are per tab. The demo toolbar switches identities. `/system-states` contains failure, expiry, draft-discard and data-reset simulators.

```sh
npm run typecheck
npm run lint
npm test
npm run test:e2e
NEXT_PUBLIC_DATA_MODE=demo npm run build
NEXT_PUBLIC_DATA_MODE=demo npm start
```

The browser suite uses installed Google Chrome and starts a localhost development server. It stores screenshots and failure traces in ignored `test-results/`. No deployment is configured or performed.

## Integration mode

**Demo only.** There is no real authentication, Firestore persistence, invitation sending, email delivery, or server authorization. Development defaults to demo; production requires `NEXT_PUBLIC_DATA_MODE=demo` explicitly to preview. `live`, an unknown value, or an unset production mode shows a configuration error and loads no synthetic workspace data.

Implement the `WorkspaceService` contract and real authentication before enabling live mode. Do not expose Admin SDK credentials in browser code. The production prerequisites and remaining design differences are recorded in the documentation below.

## Documentation

- [Screen map](docs/screen-map.md): exact screen IDs, routes and earlier alternatives.
- [Design system](docs/design-system.md): source tokens, shared components, responsive behavior and reference limitations.
- [Roles and permissions](docs/roles-and-permissions.md): centralized access rules and enforcement boundaries.
- [Backend integration](docs/backend-integration.md): typed service contract, demo semantics and live prerequisites.
- [Implementation progress](docs/implementation-progress.md): page-by-page verification and limitations.

Original screenshots and read-only Stitch metadata are in `design-references/`. They are reference material and are never embedded as application screens.
# Nexalis
