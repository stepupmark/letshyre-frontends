# Architecture decisions

One file per decision: what we chose, why, and what it costs. A decision that changes gets a new
record that supersedes the old one; old records stay as written.

| #                                        | Decision                                                 | Status   |
| ---------------------------------------- | -------------------------------------------------------- | -------- |
| [0001](./0001-monorepo.md)               | pnpm + Turborepo monorepo with `@workspace/*` packages   | Accepted |
| [0002](./0002-react-router-rendering.md) | React Router 8: prerendered marketing, SPA app           | Accepted |
| [0003](./0003-shadcn-defaults.md)        | shadcn defaults, never edited; status tokens beside them | Accepted |
| [0004](./0004-incremental-rollout.md)    | Incremental rollout on `letshyre.ai`; subdomain later    | Accepted |
| [0005](./0005-session-storage.md)        | Tokens stay in `localStorage` under the legacy keys      | Accepted |
| [0006](./0006-data-layer.md)             | `ky` + Zod-parsed responses, TanStack Query, RHF + Zod   | Accepted |
| [0007](./0007-i18n-readiness.md)         | A locale ships whole and reviewed, or not at all         | Accepted |
| [0008](./0008-motion.md)                 | Motion only where it explains a change                   | Accepted |
| [0009](./0009-one-sign-in.md)            | One sign-in page for both roles                          | Accepted |
| [0010](./0010-setup-checklist.md)        | Setup checklist and tips instead of a modal tour         | Accepted |
| [0011](./0011-data-tables.md)            | `@tanstack/react-table` for every table                  | Accepted |
| [0012](./0012-csp-hashes.md)             | Hash-based CSP, report-only until a clean week           | Accepted |
| [0013](./0013-marketing-file-routes.md)  | File-based routing for marketing                         | Accepted |
| [0014](./0014-app-route-config.md)       | The app keeps its explicit `routes.ts`                   | Accepted |
