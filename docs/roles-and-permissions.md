# Roles and permissions

Centralized helpers: `src/domain/permissions.ts`. All demo mutations independently validate authorization and invariants in `src/domain/commands.ts`; hidden controls are not the only demo check. **These are browser-side demonstrations, not production security.**

| Capability                     | Administrator                    | Project Manager                                                       | Team Member                      | Viewer                  |
| ------------------------------ | -------------------------------- | --------------------------------------------------------------------- | -------------------------------- | ----------------------- |
| View projects/tasks/reports    | All workspace projects           | Projects where a member                                               | Projects where a member          | Projects where a member |
| Create projects                | Yes                              | No                                                                    | No                               | No                      |
| Edit project details           | All                              | Assigned projects                                                     | No                               | No                      |
| Archive/restore projects       | Yes                              | No                                                                    | No                               | No                      |
| Create tasks                   | Yes                              | Member projects                                                       | Member projects                  | No                      |
| Edit task fields/status        | All accessible active work       | All in assigned projects; own assigned tasks in other member projects | Own assigned tasks               | No                      |
| Reassign tasks                 | Yes                              | Assigned projects                                                     | No                               | No                      |
| Initial assignment on creation | Active project members           | Active project members when managing; otherwise self/unassigned       | Self/unassigned                  | Not applicable          |
| Comment                        | Accessible non-archived projects | Accessible non-archived projects                                      | Accessible non-archived projects | No                      |
| Add/remove project members     | Yes                              | Assigned non-archived projects                                        | No                               | No                      |
| Assign/change project manager  | Yes                              | No                                                                    | No                               | No                      |
| Manage workspace users/roles   | Yes                              | No                                                                    | No                               | No                      |
| Workspace settings             | Yes                              | No                                                                    | No                               | No                      |
| Own profile/preferences        | Yes                              | Yes                                                                   | Yes                              | Yes                     |

Project manager privileges require both the `Project Manager` workspace role and `project.managerId === user.id`, plus membership. In another project a manager gets normal member rights. An Administrator has access regardless of membership, but task assignees must still be active project members. Assigned managers must remain members. Inactive users cannot access or mutate the workspace.

Archived project task creation, edits, status changes, comments and membership changes are rejected. Records stay readable. Administrators can restore the lifecycle status in Edit Project. A manager cannot change project lifecycle, manager ownership or workspace roles.

Project member removal previews assigned tasks and requires explicit unassignment confirmation when assignments exist. All assignments, including completed tasks, are cleared so no task retains an out-of-project assignee. The lead manager must be replaced before removal. Deactivation explicitly unassigns the member's work; active project managers must be replaced first. The final active Administrator cannot be demoted or deactivated.

Direct inaccessible project/task URLs show access denied; unknown IDs show not found. Cross-tab changes update permissions from storage subscriptions. Mutations re-read current records before checking access, so permission loss is enforced even when an older form is open. Task forms capture the original record version; a stale submission receives a conflict and instructions to close/reopen the form before reapplying changes.

Backend Firestore Rules and authenticated server-operation tests are still required. The demo contains only synthetic data and is intentionally inspectable in browser storage.
