# apps/admin audit and implementation plan

Audit of `apps/admin` on 2026-11-09, at `c4a869fa`. It covers security, responsive layout, UI/UX,
code quality and generic "template" styling. Each finding names the file and the fix, then the work
is grouped into phases that can each ship as one PR scoped `admin`.

## How it was checked

- Read the shell, dashboard, shared data table, every list and detail page pattern, auth and session
  code, the CSP build (`scripts/postbuild.ts`, `tooling/csp.ts`) and the payment-gateway feature.
- Grepped against the rules in `CLAUDE.md` and `apps/admin/CLAUDE.md`: logical properties, arbitrary
  values, shadows and blur, comments, fixed widths.
- Ran `pnpm --filter admin lint`, `pnpm --filter admin typecheck` and `pnpm knip`.
- Unit and e2e suites were not run, because nothing was changed. The app was not opened in a browser.

| Check       | Result                                                                   |
| ----------- | ------------------------------------------------------------------------ |
| `lint`      | Passes                                                                   |
| `typecheck` | Passes                                                                   |
| `knip`      | No findings printed; exit code not captured, rerun on its own in phase 5 |

## What is already in good shape

- Every response is parsed with Zod, filters live in the URL, and mutation toasts and invalidation
  come from `meta`.
- CSV export guards against formula injection and writes a BOM for Excel.
- Aadhaar goes through `SensitiveValue`; user links go through `safeUrl` / `ExternalLink`.
- `requireAdmin` drops non-admin sessions, ends the session on 403, and the idle timeout spans tabs.
- Recharts and the command palette are lazy-loaded to stay under the 175 kB budget.

## Findings

### Security

| #   | Severity | Finding                                                                                                                                                                                                                                                                              | Fix                                                                                                                                                                                                                        |
| --- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1  | **High** | The API returns gateway `client_secret` in plaintext. The UI parses it, can reveal and copy it, and pre-fills it into the edit form, so live payment keys sit in the browser and the query cache. `payment-gateways.schema.ts:21`, `gateway-card.tsx:124`, `utils/gateway-values.ts` | Backend returns only `has_secret` or a masked tail and treats an empty secret on edit as "keep". Frontend drops the field from the schema, replaces reveal/copy with "Replace secret", and leaves the field empty on edit. |
| S2  | Medium   | CSV export downloads every matching candidate's email and phone in one click, with no confirmation, count or audit. `candidates-page.tsx:41`, `data-table-export.tsx`                                                                                                                | Confirm before export, showing the row count and that it contains personal data. Log it if the API has an audit endpoint.                                                                                                  |
| S3  | Medium   | The CSP is report-only unless `CSP_ENFORCE=true`, and `frame-ancestors` depends on hosting that isn't chosen. `scripts/postbuild.ts:36`                                                                                                                                              | Write the header checklist into the README and ADR 0015; set a date to enforce.                                                                                                                                            |
| S4  | Medium   | KYC and candidate PDFs load in an unsandboxed iframe, typed by URL extension alone. `document-preview.tsx:22`                                                                                                                                                                        | Ask the backend to serve uploads with the right `Content-Type`, `nosniff` and `Content-Disposition`.                                                                                                                       |
| S5  | Low      | Approve-KYC and delete-coupon close their `ConfirmDialog` straight away instead of staying open while pending. `kyc-review-page.tsx:157`, `coupons-page.tsx:290`                                                                                                                     | Close from `onSuccess`, as `ConfirmDialog` documents.                                                                                                                                                                      |

### Responsive

- **R1** At 375px the candidates toolbar (search, 4 fixed-width selects, Views, Export) takes 4–5
  rows before the first record. Lists use different filter patterns (inline selects on candidates,
  a popover on payments).
- **R2** At 768–1280px with the sidebar open, 7-column tables scroll sideways and the name column
  scrolls out of view. There is no column priority.
- **R3** Charts use `aspect-3/1`, about 110px tall on a phone. The revenue bar click (to that month's
  payments) is mouse-only.
- **R4** On mobile, KYC review puts the 70svh document viewer below all the details, and Approve
  scrolls off screen.
- **R5** Six revenue cards on a 4-column grid leave a 2-card orphan row at `xl`.

### UI/UX and generic styling

- **D1** All 26 h1/h2 headings use `text-brand-text`, so colour stops meaning "interactive".
- **D2** 9 stat cards on the dashboard and 5 on candidates, each with a decorative corner icon.
- **D3** "Active today / this week / this month" link to the unfiltered candidate list.
- **D4** The dashboard doesn't show pending KYC or jobs awaiting approval, though the list endpoints
  return `count` and both filter by status.
- **D5** Single-item nav groups ("Overview", "Operations") and wordy labels ("Job Management",
  "Payments History", "KYC Verification").
- **D6** `ai-interview`, `matching` and `notifications` are coming-soon routes reachable by URL but
  not in the sidebar.
- **D7** Translucent header with backdrop blur; arbitrary sizes (`text-[13px]`, `text-[11px]`).

### Code quality

- **Q1** The activity section queries the range and twice the range separately; one query for twice
  the range, sliced, gives both. `activity-section.tsx:37`
- **Q2** Back button, skeleton and error scaffolding copied across 4 detail pages; `Section` exists
  twice; payments rebuilds `FilterSelect` inline.
- **Q3** `text-right` / `align: "right"` in the data table breaks the logical-properties rule. 30
  `/** */` blocks, many restating the code.
- **Q4** README says the dev port is 5175; `vite.config.ts` uses 5176.
- **Q5** E2E covers access, session, credits and smoke, not KYC decisions or payment gateways.

## Phases

Before each phase, capture screenshots at 375, 768, 1280 and 1536px in light and dark mode with
the e2e mocks, and compare after.

### Phase 0: Baseline

- Screenshot every route at the four widths in both themes.
- Fix the README port (Q4).

### Phase 1: Security

1. S1, once the backend change lands: schema, card and form changes above.
2. S2: export confirmation.
3. S5: confirm dialogs stay open while pending, everywhere.
4. S3, S4: hosting checklist, enforcement date, backend upload headers.
5. E2E: the secret never reaches the page; KYC approve and reject.

### Phase 2: Shell and navigation

- Sidebar: Overview · Review (KYC, Jobs) · People · Finance · System, with short labels.
- Pending-count badges on KYC and Jobs.
- Solid header background.
- Remove or keep the coming-soon routes (D6).

### Phase 3: Shared building blocks

- `KpiStrip`: one bordered row with dividers, label, value and change where data exists, no icons.
  Replaces `StatCard` walls.
- `FilterBar`: search inline, other filters in a popover on desktop and a sheet on mobile, with a
  count badge and one Clear. View, Export and Saved views fold into "More" on mobile.
- `DetailPage`: back link, title, metadata, actions that stick to the bottom on mobile.
- `DataTable`: sticky first column, a `priority` meta that hides low-priority columns below `lg`,
  `align: "end"`, density on the type scale.
- Charts: minimum height on mobile, a text summary, keyboard-reachable month links.
- Headings in `text-foreground`; brand colour only for active and link states.

### Phase 4: Pages

1. Dashboard: "Needs review" row from existing list counts, revenue `KpiStrip`, one activity query,
   no misleading links.
2. KYC review: Details and Documents tabs on mobile, sticky Approve and Reject.
3. Candidates, Employers, Jobs, Unlocks, Payments: `FilterBar`, `KpiStrip`, column priorities.
4. Credits, Coupons, Payment gateways, Settings: `DetailPage` and consistent form layout.

### Phase 5: Cleanup

- Comment pass under the `CLAUDE.md` rule.
- Merge duplicate `Section`s and the inline select.
- Replace arbitrary values with scale steps.
- Run `pnpm knip` on its own and fix what it reports.

### Phase 6: Tests

- E2E: export confirmation, gateway form, KYC decisions.
- Unit: activity comparison slicing.
- Axe at mobile width.

Each phase is checked with:

```bash
pnpm --filter admin lint
pnpm --filter admin typecheck
pnpm --filter admin build
pnpm --filter admin exec playwright test --project=chromium
```

## Open decisions

- S1: can the backend stop returning gateway secrets? Without it the frontend can only hide them.
- D6: delete the three coming-soon routes, or keep them for upcoming work?
