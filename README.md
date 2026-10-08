# LetsHyre frontend

pnpm + Turborepo monorepo for letshyre.ai. Node 24, pnpm 10.

| App                                  | What it is                                              | Dev                     |
| ------------------------------------ | ------------------------------------------------------- | ----------------------- |
| [`apps/marketing`](apps/marketing)   | Public site, prerendered in 19 locales                  | `http://localhost:5173` |
| [`apps/app`](apps/app)               | Employer and candidate dashboards, sign-in and register | `http://localhost:5175` |
| [`apps/admin`](apps/admin/README.md) | Internal admin panel, English only, never indexed       | `http://localhost:5176` |

Shared packages live in `packages/`: `ui` (shadcn, never edited), `blocks`, `api`, `auth`, `i18n`,
`analytics`, `eslint-config` and `typescript-config`.

```bash
pnpm install
cp apps/<app>/.env.example apps/<app>/.env
pnpm --filter <app> dev
```

| Script                        | Does                                                      |
| ----------------------------- | --------------------------------------------------------- |
| `pnpm lint` / `typecheck`     | Every workspace, through Turbo                            |
| `pnpm build`                  | Every app; each postbuild checks its CSP and JS budget    |
| `pnpm test` / `pnpm test:e2e` | Vitest / Playwright against the built apps                |
| `pnpm verify`                 | What CI runs: all of the above plus `ui:drift` and `knip` |

Commits follow Conventional Commits with lowercase subjects; lefthook formats and checks them.

## Docs

- [Architecture decisions](docs/adr/README.md): why things are the way they are.
- [Starting a new app](docs/new-app.md) and the [app design checklist](docs/design/app-design.md).
- [Marketing launch checklist](docs/launch-checklist.md).
- [Production baseline](docs/baseline/README.md) and the [URL contract](docs/baseline/url-contract.md)
  the marketing e2e tests hold the site to.
- [Token storage](docs/security/token-storage.md).
