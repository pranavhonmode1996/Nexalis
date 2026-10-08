# Backend integration

## Inspection outcome

The original repository had no Firebase setup, Authentication handlers, Firestore models, Cloud Functions, email service, API routes, credentials, rules, documented server contracts or existing application. No working integration was replaced.

## Explicit modes

`NEXT_PUBLIC_DATA_MODE=demo` selects the labelled browser-only adapter. Development uses demo by default. Production requires an explicit demo setting for previews; absent configuration, `live`, or an unknown setting fails closed with a configuration state. There is no catch-and-fallback path from live failures to synthetic data.

The account-entry page selects synthetic identities, requires no password, and prominently says real authentication is absent. No Firebase writes, real invitations, business emails, identity checks or digital signatures occur. Email notification settings store a preference only.

## Typed boundary

`src/domain/types.ts` defines `User`, `Project`, `Task`, `Comment`, `Activity`, `Workspace`, preferences, versioned records and a discriminated `Command` union. These are proposed contracts derived from the supplied product requirements, **not claimed existing Firestore schemas**.

`src/services/workspace-service.ts` specifies:

| Operation                      | Purpose                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------ |
| `load()`                       | Fetch the current authorized workspace snapshot                                |
| `execute(actorId, command)`    | Apply an authenticated protected business operation and return committed state |
| `subscribe(onChange, onError)` | Follow data/permission changes; return cleanup                                 |
| `clear()`                      | Detach listeners and clear protected adapter caches                            |

The live adapter must derive actor identity from an authenticated server session, not trust the browser's `actorId`. It must scope reads to authorized projects. Replace demo identity selection with real Firebase Authentication and session lifecycle handling. The current provider is explicitly a demo provider until that work is done.

## Demo semantics

- One synthetic snapshot lives under `nexalis.demo.workspace.v1` in localStorage. Each tab stores its own 12-hour persona session in sessionStorage. No real personal data is seeded.
- Web Locks serialize cross-tab mutations. Every command re-reads persisted data inside the lock, checks role/membership, validates fields and compares record versions. Browsers lacking Web Locks fail with a configuration message for mutation safety.
- Mutations are pessimistic: controls wait for the adapter to commit. Failed requests leave stored data and connected views unchanged; there is no optimistic state requiring rollback.
- Task/project/user/workspace versions detect concurrent edits. Conflict messages explain how to reload the latest form version.
- Successful project/task/comment/member business commands create synthetic activity entries in the same local transaction. No email events are emitted from effects or page loads.
- A storage listener propagates changes to other tabs and is cleaned up when the session changes/unmounts. Logout clears protected in-memory state; account switching loads fresh data. Session generation checks ignore late mutation responses after logout or account switching.
- The snapshot is not a security boundary and can be edited by the browser owner. Tests demonstrate intended behavior only.
- Due dates are ISO `YYYY-MM-DD` strings. Timestamps are UTC ISO strings, rendered in `Asia/Dubai`. No shared Next.js server cache contains user data.

## Live implementation prerequisites

1. Supply the actual Firestore schema, indexes, query shapes, session contract and authorized operation endpoints.
2. Integrate Firebase Authentication and verified session identity, session expiry and permission-loss events. Scope every query and subscription by authorized membership; clear caches on logout/account switching.
3. Implement protected project/task/member/user/workspace operations server-side. Enforce invariants, optimistic version checks and transactions there. Do not write directly to protected collections from frontend components.
4. Preserve or implement activity and email-event creation atomically with successful backend events. A trusted worker handles email delivery and idempotency; never send from render, effects or page loads.
5. Add Firestore Rules and emulator/server tests for read/write denial, forged roles, inaccessible project IDs, stale membership, inactive assignees, archived records and last-Administrator invariants.
6. Store Firebase Admin credentials and email secrets only in server-side secret configuration, never `NEXT_PUBLIC` variables. Review production cache headers and authenticated rendering.
7. Resolve the development-tool dependency audit advisory before production CI approval. Current runtime production dependency audit is separately recorded in progress documentation.

No deployment, billing change or real email operation is part of this implementation.
