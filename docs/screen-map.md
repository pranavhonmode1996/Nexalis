# Stitch screen map

Project: **Nexalis Workspace Task Management**, `17169495214196134972`. Read-only retrieval; no Stitch designs were created, edited or deleted.

The available list contains 16 visible W01–W16 desktop screens. Project metadata also contains four hidden earlier screens and one hidden design-system instance. The user calls the designs approved; the API provides visibility and titles but no separate approval flags. Accordingly, the visible numbered set is the implementation reference set. Hidden screens are classified as earlier alternatives based on metadata and their overlapping content, not separate approved routes.

| Product ID | Actual Stitch screen name     | Actual screen ID                   | Route / presentation                   |
| ---------- | ----------------------------- | ---------------------------------- | -------------------------------------- |
| W01        | W01 — Account Entry           | `c4c72ec7bc5740119a5625ddf69f4deb` | `/login`                               |
| W02        | W02 — Dashboard               | `488544f8bd454f2a965252e424b74e21` | `/dashboard`                           |
| W03        | W03 — Projects                | `967440418fb146b3abff97cb251960f4` | `/projects`                            |
| W04        | W04 — Create & Edit Project   | `1665a06b00b649fbb7ffca73da40dad0` | `Shared create/edit project modal`     |
| W05        | W05 — Project Overview        | `fd090eb9240f4b0f8a12282bd532f7ee` | `/projects/[projectId]`                |
| W06        | W06 — Project Board           | `6bfda21b7dfe48c8857055e1012b01bd` | `/projects/[projectId]/board`          |
| W07        | W07 — Project Task List       | `3d72b844c45744aab25c2e0773f89c34` | `/projects/[projectId]/tasks`          |
| W08        | W08 — Create & Edit Task      | `3f3bc00b590c4ddb801ad197fe9e713f` | `Shared create/edit task drawer`       |
| W09        | W09 — Task Details            | `2deba0cefa1e437fa793a1d8047edfcd` | `/projects/[projectId]/tasks/[taskId]` |
| W10        | W10 — My Tasks                | `d4daec93fa7e4246a9f758e6e543cb02` | `/my-tasks`                            |
| W11        | W11 — Workspace Team          | `59c993a319514a3eb04589196193ff92` | `/team`                                |
| W12        | W12 — Project Members         | `7bb194e9cf074fdab9b060ba81be357b` | `/projects/[projectId]/members`        |
| W13        | W13 — Reports & Analytics     | `c0ea8959adb64d4ab69c76d18e5cf2b8` | `/reports`                             |
| W14        | W14 — Account and Preferences | `ce318ba0776d459ab1614b45d67ea435` | `/settings/account`                    |
| W15        | W15 — Workspace Settings      | `f4d9e07b99d34f3bba4398f5a13e53f2` | `/settings/workspace`                  |
| W16        | W16 — Shared System States    | `2706a6358a944733a4dbc2844f2296bc` | `/system-states + contextual states`   |

## Earlier hidden alternatives

All four were retrieved individually and visually inspected. They map to shared product pages; none becomes a duplicate route.

| Actual title       | Actual ID                          | Classification / mapping                                           |
| ------------------ | ---------------------------------- | ------------------------------------------------------------------ |
| Project Task List  | `2656722e42f94132906e1068a8965ddd` | Earlier list with task inspector; represented by W07, W08 and W09. |
| Team & Access      | `26627c4784454a64aa7abf1cc578432c` | Earlier access directory; represented by W11.                      |
| Project Task Board | `6709a8d261fd4c5bb94a4b828eef8ec1` | Earlier board with task inspector; represented by W06 and W09.     |
| Workspace Overview | `9568b97b8e054bd89b6400818dd6badc` | Earlier dashboard; represented by W02.                             |

Design-system instance: `assets_296371bb1df24dab9d42868e0b2bff9b` (hidden); reference asset `assets/296371bb1df24dab9d42868e0b2bff9b`.

## Source availability

- All 20 screenshots downloaded and inspected. W01–W16 are local `design-references/Wxx.png`; earlier screens use `variant-{id}.png`.
- HTML export URLs were retrieved, but downloading returned Google sign-in HTML. Those responses were discarded. Layout code and original standalone image assets remain unavailable.
- All screens are `DESKTOP`; no mobile/tablet variants were returned. Responsive views are adaptations of the supplied hierarchy and design system.
- No extra visible approved pages outside W01–W16 were returned.
- Page dependencies, role constraints, implementation, visual and behavior verification, integration mode and remaining actions are tracked in [implementation-progress.md](implementation-progress.md).
